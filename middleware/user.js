import { User } from "../models/index.js";

export const userMiddleware = async (ctx, next) => {
  if (!ctx.from) return next();

  const tgId = ctx.from.id.toString();
  const username = ctx.from.username || "unknown";

  let [user, created] = await User.findOrCreate({
    where: { telegramId: tgId },
    defaults: { username },
  });

  if (created) {
    return ctx.reply("Welcome, new user!");
  }

  // Keep username updated if changed
  if (user.username !== username) {
    user.username = username;
    await user.save();
  }

  ctx.state.user = user;
  return next();
};
