const Mutation = {
  async createItem(parent, args, ctx, info) {
    //TODO check authentication before writing to db

    const item = await ctx.db.mutation.createItem(
      { data: { ...args.data } },
      info
    );

    return item;
  }
};

module.exports = Mutation;
