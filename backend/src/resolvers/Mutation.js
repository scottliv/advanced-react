const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");
const Mutation = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args.data,
          // this is how prisma creates a relationship between item and user
          user: {
            connect: {
              id: ctx.request.userId
            }
          }
        }
      },
      info
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    return ctx.db.mutation.updateItem(
      {
        data: { ...args.data },
        where: { id: args.id }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );

    if (!ownsItem || !hasPermissions) {
      throw new Error("I can't let you do that");
    }

    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    //Hash Password
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    //Create JWT Token to sign in user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error(`Incorrect password`);
    }
    //Create JWT Token to sign in user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    const asyncRandomBytes = promisify(randomBytes);
    const resetToken = (await asyncRandomBytes(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour from current time

    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    const mailRes = await transport.sendMail({
      from: "scottdlivingstone@gmail.com",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeEmail(
        `Your Password Reset Token is Here \n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset your password</a>`
      )
    });

    return { message: "tahnks!" };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.passwordConfirm) {
      throw new Error("Passwords do not match");
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 1000 * 60 * 60
      }
    });
    if (!user) {
      throw new Error("Reset token is invalid or expired");
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { id: user.id },
      data: { password, resetToken: null, resetTokenExpiry: null }
    });
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: { set: args.permissions }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    const [currentCartItem] = await ctx.db.query.cartItems(
      { where: { user: { id: userId }, item: { id: args.id } } },
      info
    );
    if (!currentCartItem) {
      return ctx.db.mutation.createCartItem(
        {
          data: {
            user: { connect: { id: userId } },
            item: { connect: { id: args.id } },
            quantity: 1
          }
        },
        info
      );
    }
    return ctx.db.mutation.updateCartItem(
      {
        where: { id: currentCartItem.id },
        data: {
          quantity: currentCartItem.quantity + 1
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{id, user {id}}`
    );
    if (!cartItem) throw new Error("No Item Found");
    if (cartItem.user.id !== userId) {
      throw new Error("This cart item does not belong to you");
    }
    return ctx.db.mutation.deleteCartItem({ where: { id: cartItem.id } }, info);
  },
  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You must be logged in");
    }
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart { 
          id 
          quantity 
          item {
            title 
            price 
            id 
            description 
            image
            largeImage
          }
        }
      }`
    );

    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log("chargin: " + amount);

    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token
    });

    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });

    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    return order;
  }
};

module.exports = Mutation;
