import { User } from "../models/index.js";

export const userMiddleware = async (ctx, next) => {
  if (!ctx.from) return next();

  const tgId = ctx.from.id.toString();
  const username = ctx.from.username || "unknown";

  let [user, created] = await User.findOrCreate({
    where: { telegramId: tgId },
    defaults: { username },
  });

  // Keep username updated if changed (for both new and existing users)
  if (user.username !== username) {
    user.username = username;
    await user.save();
  }

  ctx.state.user = user;
  return next();
};