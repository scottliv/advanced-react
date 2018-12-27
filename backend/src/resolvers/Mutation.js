const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { createJWT } = require("../utils");
const { transport, makeEmail } = require("../mail");
const Mutation = {
  async createItem(parent, args, ctx, info) {
    //TODO check authentication before writing to db
    const item = await ctx.db.mutation.createItem(
      { data: { ...args.data } },
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
    const item = await ctx.db.query.item({ where }, `{id title}`);

    //TODO check permissions

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
  }
};

module.exports = Mutation;
