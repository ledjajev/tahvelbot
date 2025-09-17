import { RATE_LIMIT, WINDOW_MS } from "../config.js";

export async function rateLimitMiddleware(ctx, next) {
    const now = Date.now();

    if (!ctx.session.rateLimit) {
        ctx.session.rateLimit = { count: 0, lastReset: now };
    }

    const rl = ctx.session.rateLimit;

    // reset counter if window has passed
    if (now - rl.lastReset > WINDOW_MS) {
        rl.count = 0;
        rl.lastReset = now;
    }

    if (rl.count >= RATE_LIMIT) {
        // If it's a callback query → show popup
        if (ctx.callbackQuery) {
            return ctx.answerCbQuery("⏳ Slow down! Too many requests. Please wait.", { show_alert: false });
        }

        // If it's a normal message → send ephemeral message
        if (ctx.message) {
            const msg = await ctx.reply("⏳ Slow down! Too many requests. Please wait.");
            setTimeout(() => {
                ctx.deleteMessage(msg.message_id).catch(() => {});
            }, 3000); // auto-delete after 3s
            return;
        }

        // fallback (other update types, e.g. inline_query)
        return;
    }

    rl.count++;
    return next();
}
