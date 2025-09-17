let syncing = false;

export function setSyncing(value) {
    syncing = value;
}

export async function syncGuardMiddleware(ctx, next) {
    if (syncing) {
        return ctx.reply("⚡ Data sync is in progress, try again later...");
    }
    return next();
}