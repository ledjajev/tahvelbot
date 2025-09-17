import { TAHVELTP_BACKEND } from "../config.js";
import fetch from "node-fetch";
import { Institution, Group } from "../models/index.js";

export async function syncGroups() {
  try {
    const institutions = await Institution.findAll();
    const totalInstitutions = institutions.length;
    const now = new Date();

    console.log(`🚀 Starting group sync for ${totalInstitutions} institutions...`);

    let index = 0;
    for (const institution of institutions) {
      index++;

      // ⏳ Check most recently updated group for this institution
      const latestGroup = await Group.findOne({
        where: { InstitutionId: institution.id },
        order: [["updatedAt", "DESC"]],
      });

      if (latestGroup) {
        const ageMs = now - new Date(latestGroup.updatedAt);
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (ageMs < oneDayMs) {
          console.log(
            `⏭️ [${index}/${totalInstitutions}] Skipping ${institution.code}, groups synced recently (${latestGroup.updatedAt.toISOString()})`
          );
          continue;
        }
      }

      console.log(
        `\n🏫 [${index}/${totalInstitutions}] Syncing groups for institution: ${institution.code} (${institution.id})`
      );

      const url = `${TAHVELTP_BACKEND}timetables/group/${institution.id}`;
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`⚠️ Failed to fetch groups for institution ${institution.id}: ${res.statusText}`);
        continue;
      }

      const data = await res.json();
      if (!data.content || !Array.isArray(data.content)) {
        console.error(`⚠️ Unexpected group response for institution ${institution.id}`);
        continue;
      }

      let validCount = 0;

      for (const item of data.content) {
        const validFrom = item.validFrom ? new Date(item.validFrom) : null;
        const validThru = item.validThru ? new Date(item.validThru) : null;

        // Skip invalid groups
        if ((validFrom && now < validFrom) || (validThru && now > validThru)) {
          continue;
        }

        await Group.upsert({
          id: item.id,
          InstitutionId: institution.id,
          nameEt: item.nameEt,
          nameEn: item.nameEn,
          nameRu: item.nameRu,
          curriculum: item.curriculum,
          merCode: item.merCode,
          curriculumVersion: item.curriculumVersion,
          studyForm: item.studyForm,
          language: item.language,
          validFrom: item.validFrom,
          validThru: item.validThru,
          isBasic: item.isBasic,
          isSecondary: item.isSecondary,
          isVocational: item.isVocational,
          isHigher: item.isHigher,
          isOccupied: item.isOccupied,
          studentGroupUuid: item.studentGroupUuid,
        });

        validCount++;
      }

      console.log(`✅ Synced ${validCount} valid groups for institution ${institution.code}`);
    }

    console.log(`\n🎉 Finished syncing groups for all ${totalInstitutions} institutions`);
  } catch (err) {
    console.error("❌ Group sync failed:", err.message);
  }
}
