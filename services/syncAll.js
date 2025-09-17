import { syncInstitutions } from "./institutionSync.js";
import { syncClassifiers } from "./classifierSync.js";
import { syncGroups } from "./groupSync.js";
import { setSyncing } from "../middleware/syncGuard.js";

export async function syncAll() {
    try {
        setSyncing(true);
        console.log("🔄 Starting full sync...");
        await syncInstitutions();
        await syncClassifiers();
        await syncGroups();
        console.log("✅ Full sync completed");
    } catch (err) {
        console.error("❌ Sync error:", err.message);
    } finally {
        setSyncing(false);
    }
}
