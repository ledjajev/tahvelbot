import { TAHVELTP_BACKEND } from "../config.js";
import fetch from "node-fetch";
import { Classifier } from "../models/index.js";

const API_URL = TAHVELTP_BACKEND + "autocomplete/classifiers?mainClassCode=MAHT";

export async function syncClassifiers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch classifiers: ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected API response format");
    }

    // Sync each classifier (insert or update)
    for (const item of data) {
      await Classifier.upsert({
        code: item.code,
        nameEt: item.nameEt,
        nameEn: item.nameEn,
        nameRu: item.nameRu,
        valid: item.valid,
        mainClassCode: item.mainClassCode,
        secondary: item.secondary,
        vocational: item.vocational,
        higher: item.higher,
        value: item.value,
        value2: item.value2,
        validFrom: item.validFrom,
        validThru: item.validThru,
        extraval1: item.extraval1,
        extraval2: item.extraval2,
        parents: item.parents,
      });
    }

    console.log(`✅ Synced ${data.length} classifiers`);
  } catch (err) {
    console.error("❌ Classifier sync failed:", err.message);
  }
}
