/**
 * Patent Table Schema
 *
 * This schema defines the structure for patent application records.
 * It follows the Supaplate project conventions including use of Drizzle ORM
 * and server-side helpers for identity and timestamps.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUid, authUsers, authenticatedRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

// enum 정의: '예', '아니오'
export const yesNoEnum = pgEnum("yes_no", ["예", "아니오"]);

export const patents = pgTable(
  "patents",
  {
    // PK: Primary key for patent record (UUID)
    ...makeIdentityColumn("patent_id"),

    // 🔹 필수 항목 (required fields)
    our_ref: text().notNull(), // 내부 관리번호
    status: text().notNull(), // 현재 상태
    application_type: text().notNull(), // 출원종류 (신규/분할/PCT 등)

    // 🔹 사용자 연결 필드 (외래키)
    user_id: uuid().references(() => authUsers.id, {
      onDelete: "cascade",
    }),

    // 🔸 선택 항목 (optional fields)
    // applicant_name: text(), // 출원인
    applicant: jsonb().default(sql`'[]'::jsonb`), // 복수 출원인 [{name_kr, name_en, code, address_kr, address_en}]
    assignee: jsonb().default(sql`'[]'::jsonb`), // 복수 권리자 [{name_kr, name_en, code, address_kr, address_en}]
    inventor: jsonb().default(sql`'[]'::jsonb`), // 복수 발명자 [{name_kr, name_en, code, address_kr, address_en}]

    filing_date: timestamp(), // 출원일
    application_number: text(), // 출원번호
    title_kr: text(), // 국문명칭
    applicant_reference: text(), // 출원인 관리번호
    registration_date: timestamp(), // 등록일
    registration_number: text(), // 등록번호
    examination_requested_at: timestamp(), // 심사청구일
    examination_request_due: timestamp(), // 심사청구마감일
    annuity_due_date: timestamp(), // 연차마감일
    attorney_name: text(), // 담당 변리사
    abandonment_date: timestamp(), // 포기/취하일
    abandonment_reason: text(), // 포기/취하 내용
    pct_application_number: text(), // 국제출원번호
    pct_application_date: timestamp(), // 국제출원일
    priority_date: timestamp(), // 우선일
    request_date: timestamp(), // 신청일
    filing_deadline: timestamp(), // 출원 마감일
    title_en: text(), // 영문명칭
    claims_due_date: timestamp(), // 청구범위 마감일
    claims_submitted_at: timestamp(), // 청구범위 제출일
    publication_date: timestamp(), // 공개일
    publication_number: text(), // 공개번호
    decision_to_register_date: timestamp(), // 등록결정일
    registration_deadline: timestamp(), // 등록마감일
    late_registration_penalty_due: timestamp(), // 등록과태마감일
    protection_term: text(), // 권리존속기간
    is_annuity_managed: boolean(), // 연차관리 여부
    // inventor: text(), // 발명자
    // assignee: text(), // 권리자
    earliest_priority_date: timestamp(), // 최초 우선권 주장일
    expedited_examination_requested: boolean(), // 우선심사 청구 여부
    expedited_examination_date: timestamp(), // 우선심사청구일
    examination_requested: yesNoEnum("examination_requested"), // 심사청구 여부
    priority_claimed: yesNoEnum("priority_claimed"), // 우선권 주장 여부
    priority_rights: jsonb().default(sql`'[]'::jsonb`), // 우선권 정보 [배열]]

    electronic_certificate_selected: boolean().default(true),
    country_code: text(),
    prior_disclosure_exception_claimed: boolean().default(false),
    prior_disclosure_documents: jsonb().default(sql`'[]'::jsonb`),
    final_claim_count: integer(),

    //결제 되었는지 여부
    is_paid: boolean().default(false),
    paid_at: timestamp(),

    // 🔸 메타데이터 (optional json field)
    metadata: jsonb().default(sql`'{}'::jsonb`), // 객체

    // 🔹 생성일 및 수정일
    ...timestamps,
  },
  (table) => [
    // RLS Policy: Only allow authenticated users to access their own patents
    pgPolicy("select-patent-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
  ],
);

export const entities = pgTable("entities", {
  id: uuid("id").defaultRandom().primaryKey(),

  user_id: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),

  name_kr: text().notNull(),
  name_en: text(),
  client_code: text(),
  address_kr: text(),
  address_en: text(),

  // 🔹 변리사 위임 정보
  has_poa: boolean().default(false), // 위임 여부
  signature_image_url: text(), // 서명 이미지 URL
  signer_position: text().notNull(), // 직책 (자유 입력 가능)
  signer_name: text(), // 서명자 성함
  representative_name: text(), // 법인 대표자 이름

  ...timestamps,
});

export const inventors = pgTable("inventors", {
  id: uuid("id").defaultRandom().primaryKey(),

  user_id: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),

  name_kr: text().notNull(),
  name_en: text(),
  nationality: text(),
  id_number: text(),
  zipcode: text(),
  address_kr: text(),
  address_en: text(),
  residence_country: text(),

  ...timestamps,
});
