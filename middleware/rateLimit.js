import { RATE_LIMIT, WINDOW_MS } from "../config.js";

// You can extend your config to support different limits
const LIMITS = {
    message: { limit: RATE_LIMIT ?? 5, window: WINDOW_MS ?? 5000 },
    callbackQuery: { limit: (RATE_LIMIT ?? 5) * 3, window: WINDOW_MS ?? 5000 }, // more generous
    inlineQuery: { limit: (RATE_LIMIT ?? 5) * 2, window: WINDOW_MS ?? 5000 }
};

export async function rateLimitMiddleware(ctx, next) {
    const now = Date.now();

    // pick key based on update type
    let key;
    if (ctx.message) key = "message";
    else if (ctx.callbackQuery) key = "callbackQuery";
    else if (ctx.inlineQuery) key = "inlineQuery";
    else key = "default";

    const { limit, window } = LIMITS[key] || { limit: 10, window: 5000 };

    if (!ctx.session.rateLimit) ctx.session.rateLimit = {};
    if (!ctx.session.rateLimit[key]) {
        ctx.session.rateLimit[key] = { count: 0, lastReset: now };
    }

    const rl = ctx.session.rateLimit[key];

    // reset counter if window has passed
    if (now - rl.lastReset > window) {
        rl.count = 0;
        rl.lastReset = now;
    }

    if (rl.count >= limit) {
        if (ctx.callbackQuery) {
            return ctx.answerCbQuery("⏳ Slow down! Too many requests. Please wait.", { show_alert: false });
        }

        if (ctx.message) {
            const msg = await ctx.reply("⏳ Slow down! Too many requests. Please wait.");
            setTimeout(() => {
                ctx.deleteMessage(msg.message_id).catch(() => {});
            }, 3000);
            return;
        }

        return; // silent drop for other update types
    }

    rl.count++;
    return next();
}
