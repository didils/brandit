import type { Route } from "./+types/epo";

import { DateTime } from "luxon";
import { z } from "zod";

import { getEpoToken } from "~/core/epo/getEpoToken.server";
import {
  type FamilyMember,
  findKoreanApplicationReference,
} from "~/core/epo/hasKR";
import makeServerClient from "~/core/lib/supa-client.server";

/* ─────────── 국내단계 31 개월 규정에 따른 연도 하한 계산 ─────────── */
const NATIONAL_PHASE_MONTHS = 31;
const earliestAllowedYear = DateTime.now().minus({
  months: NATIONAL_PHASE_MONTHS,
}).year; // 예) 2025-07-31 → 2023
const minYearGlobal = 1900;
const currentYear = DateTime.now().year;

/* ──────────────────────── 스키마 정의 ─────────────────────────── */
export const pctFamilySchema = z
  .object({
    selectedType: z.enum(["applicationNumber", "publicationNumber"]),
    /* 입력 → 대문자로 변환 후 검증 */
    pctApplicationNumber: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase()),
  })
  .superRefine((data, ctx) => {
    const { selectedType, pctApplicationNumber: raw } = data;

    /* ── ① PCT ApplicationNumber ── */
    if (selectedType === "applicationNumber") {
      const m = /^PCT\/([A-Z]{2})(\d{4})\/(\d{1,6})$/.exec(raw); // ➊
      if (!m) {
        ctx.addIssue({
          // ➋
          code: z.ZodIssueCode.custom,
          message: "Format must be PCT/CCYYYY/NNNNNN (e.g. PCT/KR2025/000123)",
          path: ["pctApplicationNumber"],
        });
        return;
      }

      const year = +m[2]; // ➌
      if (year < earliestAllowedYear) {
        // ➍
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Year must be ${earliestAllowedYear}+ (31-month rule).`,
          path: ["pctApplicationNumber"],
        });
      }
      if (year > currentYear) {
        // ➎ 상한
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Future year (${year}) is not allowed.`,
          path: ["pctApplicationNumber"],
        });
      }
      if (year < minYearGlobal) {
        // ➏ 절대 하한
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Year must be ${minYearGlobal}+`,
          path: ["pctApplicationNumber"],
        });
      }
      return; // 통과
    }

    /* ── ② WO PublicationNumber ── */
    const m = /^WO(\d{4})\/(\d{1,6})$/.exec(raw);
    if (!m) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format must be WOYYYY/NNNNNN (e.g. WO2024/123456)",
        path: ["pctApplicationNumber"],
      });
      return;
    }

    const year = +m[1];
    if (year < earliestAllowedYear) {
      // ➍
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Year must be ${earliestAllowedYear}+ (31-month rule).`,
        path: ["pctApplicationNumber"],
      });
    }
    if (year > currentYear) {
      // ➎
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Future year (${year}) is not allowed.`,
        path: ["pctApplicationNumber"],
      });
    }
    if (year < minYearGlobal) {
      // ➏
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Year must be ${minYearGlobal}+`,
        path: ["pctApplicationNumber"],
      });
    }
  });

/**
 * PCT 출원번호(PCT/KR2025/000123)를 docdb 형식(CCccyynnnnnn)으로 변환
 */
function convertPctApplicationToDocdb(pctNumber: string): string | null {
  /* 1) 공백 제거 후 대문자로 통일 */
  const cleaned = pctNumber.trim().toUpperCase();
  // "PCT/KR2025/000123" 같은 형식을 파싱
  const match = cleaned.match(/^PCT\/([A-Z]{2})(\d{4})\/(\d+)$/);
  if (!match) return null;

  const [, country, year, serial] = match;

  const cc = "20"; // 2000년대 기준
  const yy = year.slice(2); // "2025" → "25"
  const paddedSerial = serial.padStart(6, "0"); // 6자리 zero-padding

  return `${country}${cc}${yy}${paddedSerial}`; // ✅ kind code 제거
}

/**
 * PCT 공개번호(WO2022/117128)를 docdb 형식(WOyyyynnnnnn)으로 변환 (kind code 제외)
 */
function convertPctPublicationToDocdb(
  publicationNumber: string,
): string | null {
  /* 1) 공백 제거 후 대문자로 통일 */
  const cleaned = publicationNumber.trim().toUpperCase();
  // 예: "WO2022/117128"
  const match = cleaned.match(/^WO(\d{4})\/(\d+)$/);
  if (!match) return null;

  const [, year, serial] = match;
  const paddedSerial = serial.padStart(6, "0"); // 항상 6자리로 맞춤

  return `WO${year}${paddedSerial}`;
}

const convertToDocdb = (input: string, selectedType: string) => {
  if (selectedType === "applicationNumber") {
    console.log("🚀 [convertToDocdb] convertPctApplicationToDocdb", input);
    return convertPctApplicationToDocdb(input);
  } else if (selectedType === "publicationNumber") {
    console.log("🚀 [convertToDocdb] convertPctPublicationToDocdb", input);
    return convertPctPublicationToDocdb(input);
  } else {
    console.log("🚀 [convertToDocdb] null");
    return null;
  }
};

//
// export const action = async ({ request }: Route.ActionArgs) => {
//   console.log("🚀 [action] request", request);
//   const formData = await request.formData();
//   console.log("🚀 [action] formData", formData);
//   const data = Object.fromEntries(formData);
//   const result = pctFamilySchema.safeParse(data);

//   if (!result.success) {
//     return { fieldErrors: result.error.flatten().fieldErrors, formErrors: [] };
//   }
// };

export const action = async ({ request }: Route.LoaderArgs) => {
  const [client] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  /* ① 폼 데이터 추출 */
  const formData = await request.formData();
  console.log("🚀 [formData] formData", formData);
  const formObject = Object.fromEntries(formData) as Record<string, string>;
  const parsed = pctFamilySchema.safeParse(formObject);
  if (!parsed.success) {
    console.log("🚀 [parsed] parsed", parsed);
    const { fieldErrors, formErrors } = parsed.error.flatten();
    console.log("🚀 [fieldErrors] fieldErrors", fieldErrors);
    console.log("🚀 [formErrors] formErrors", formErrors);
    // return { fieldErrors, formErrors };
    return {
      formErrors: fieldErrors.pctApplicationNumber,
    };
  }
  const selectedType = formData.get("selectedType"); // "applicationNumber" | "publicationNumber"
  const pctApplicationNumber = formData.get("pctApplicationNumber"); // "WO2022/117218" 등

  /* ② 타입 체크 */
  if (
    typeof selectedType !== "string" ||
    typeof pctApplicationNumber !== "string"
  ) {
    throw new Error("required value is missing");
  }

  /* ③ 나머지 로직은 동일 */
  const token = await getEpoToken();
  const pathPart =
    selectedType === "applicationNumber" ? "application" : "publication";
  const docdb = convertToDocdb(pctApplicationNumber, selectedType);
  console.log("🚀 [docdb] docdb", docdb);
  const url = `https://ops.epo.org/3.2/rest-services/family/${pathPart}/docdb/${docdb}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`EPO API 호출 실패: ${txt}`);
  }

  const data = await res.json();
  //   console.log("🚀 [data] data", data);
  //   console.dir(
  //     data["ops:world-patent-data"]["ops:patent-family"]["ops:family-member"],
  //     { depth: null, colors: true },
  //   );
  const familyMembers = data["ops:world-patent-data"]["ops:patent-family"][
    "ops:family-member"
  ] as FamilyMember[];

  const koreanApplicationReference =
    findKoreanApplicationReference(familyMembers);

  if (koreanApplicationReference) {
    console.log(
      "🚀 [koreanApplicationReference] koreanApplicationReference",
      koreanApplicationReference,
    );
    return {
      formErrors: [
        `This PCT application has already entered the Korean national phase(Application No. ${koreanApplicationReference.docNumber}, filed ${koreanApplicationReference.date}). You can’t create another entry.`,
      ],
    };
  }

  return { family: data };
};
