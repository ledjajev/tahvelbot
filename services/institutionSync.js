import { TAHVELTP_BACKEND } from "../config.js";

import fetch from "node-fetch";
import { Institution } from "../models/index.js";

const API_URL = TAHVELTP_BACKEND + "autocomplete/schools";

export async function syncInstitutions() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch institutions: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected API response format");
    }

    // Sync each institution (insert or update)
    for (const item of data) {
      await Institution.upsert({
        id: item.id,
        code: item.code,
        nameEt: item.nameEt,
        nameEn: item.nameEn,
        email: item.email,
        higher: item.higher,
        vocational: item.vocational,
        doctoral: item.doctoral,
        isNotPublic: item.isNotPublic,
        isNotPublicTimetable: item.isNotPublicTimetable,
        isNotPublicCurriculum: item.isNotPublicCurriculum,
        isNotPublicSubject: item.isNotPublicSubject,
      });
    }

    console.log(`✅ Synced ${data.length} institutions`);
  } catch (err) {
    console.error("❌ Institution sync failed:", err.message);
  }
}
