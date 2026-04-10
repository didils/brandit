/**
 * Annuity Management Schema
 *
 * 연차료 관리 테이블 스키마.
 * - annuity_cases   : 연차료 관리에 등록된 사건 마스터 (특허/디자인 공통)
 * - annuity_payments: 사건별 연차(4~20년차) 납부 개별 레코드
 *
 * 설계 근거
 * - 특허·디자인 모두 출원일로부터 최대 20년 존속
 * - 1~3년차는 등록료 납부 시 일괄 처리 → 관리 대상 연차는 4~20년차 (17개)
 * - 각 연차는 납부 기한(due_date), 실제 납부일(paid_date), 납부 여부(is_paid)를 독립 레코드로 관리
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authUid, authUsers, authenticatedRole } from "drizzle-orm/supabase";

import { timestamps } from "~/core/db/helpers.server";

// ── Enums ──────────────────────────────────────────────────────────────

/** 권리 종류: 특허 또는 디자인 */
export const ipTypeEnum = pgEnum("ip_type", ["patent", "design"]);

/** 사건 관리 상태 */
export const annuityCaseStatusEnum = pgEnum("annuity_case_status", [
  "active",    // 관리 중
  "lapsed",    // 권리 소멸 (연차료 미납 등)
  "abandoned", // 자진 포기·취하
]);

/** 연차별 납부 상태 */
export const annuityPaymentStatusEnum = pgEnum("annuity_payment_status", [
  "unpaid",   // 납부 전 (기한 이전)
  "paid",     // 납부 완료
  "overdue",  // 기한 초과 미납
  "waived",   // 면제 (서비스 정책 등)
]);

// ── annuity_cases ──────────────────────────────────────────────────────

/**
 * 연차료 관리 사건 마스터
 *
 * KIPRIS API로 조회하여 등록된 사건 정보를 저장한다.
 * 한 사건에 대해 annuity_payments 레코드가 최대 17개(4~20년차) 생성된다.
 */
export const annuity_cases = pgTable(
  "annuity_cases",
  {
    id: uuid().defaultRandom().primaryKey(),

    /** 등록 요청한 사용자 */
    user_id: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    /** 권리 종류: patent | design */
    ip_type: ipTypeEnum("ip_type").notNull(),

    /** 등록번호 (특허: 10-XXXXXXX, 디자인: 30-XXXXXXX) */
    registration_no: text().notNull(),

    /** 발명의 명칭 / 디자인 물품명 */
    title: text(),

    /** 출원인 (주출원인 표시명) */
    applicant: text(),

    /** 출원번호 */
    application_no: text(),

    /** 출원일 */
    application_date: date(),

    /** 등록일 */
    registration_date: date(),

    /** 권리 만료 예정일 (출원일 + 20년) — 파생값이지만 조회 편의상 저장 */
    expiry_date: date(),

    /** 사건 관리 상태 */
    status: annuityCaseStatusEnum("status").notNull().default("active"),

    /** 내부 메모 */
    notes: text(),

    ...timestamps,
  },
  (table) => [
    pgPolicy("select-annuity-cases-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("insert-annuity-cases-policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("update-annuity-cases-policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("delete-annuity-cases-policy", {
      for: "delete",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
  ],
);

// ── annuity_payments ───────────────────────────────────────────────────

/**
 * 연차별 납부 레코드
 *
 * 사건당 4~20년차에 해당하는 레코드가 개별 생성된다 (최대 17행).
 * 연차 납부 기한 도래 시 상태를 unpaid → paid / overdue 로 업데이트한다.
 */
export const annuity_payments = pgTable(
  "annuity_payments",
  {
    id: uuid().defaultRandom().primaryKey(),

    /** 소속 사건 */
    case_id: uuid()
      .notNull()
      .references(() => annuity_cases.id, { onDelete: "cascade" }),

    /** 데이터 소유자 (RLS 적용용) */
    user_id: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),

    /**
     * 연차 (4~20)
     * 1~3년차는 등록료에 포함되어 일괄 납부 → 4년차부터 관리
     */
    annuity_year: integer().notNull(),

    /** 납부 기한 */
    due_date: date().notNull(),

    /** 납부 상태 */
    payment_status: annuityPaymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),

    /** 납부 완료 여부 (빠른 조회용 플래그) */
    is_paid: boolean().notNull().default(false),

    /** 실제 납부일 (납부 완료 시 업데이트) */
    paid_date: date(),

    /** 납부 금액 (원화, KRW) */
    fee: integer(),

    /** 결제 수단 (card, bank, internal 등) */
    payment_method: text(),

    /** 결제 고유 참조번호 */
    payment_ref: text(),

    /** 내부 메모 */
    notes: text(),

    ...timestamps,
  },
  (table) => [
    /** annuity_year 범위 제약: 4~20 */
    check(
      "annuity_year_range",
      sql`${table.annuity_year} >= 4 AND ${table.annuity_year} <= 20`,
    ),
    /** 같은 사건에 동일 연차 중복 불가 */
    unique("annuity_payments_case_year_unique").on(table.case_id, table.annuity_year),
    pgPolicy("select-annuity-payments-policy", {
      for: "select",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("insert-annuity-payments-policy", {
      for: "insert",
      to: authenticatedRole,
      as: "permissive",
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("update-annuity-payments-policy", {
      for: "update",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
      withCheck: sql`${authUid} = ${table.user_id}`,
    }),
    pgPolicy("delete-annuity-payments-policy", {
      for: "delete",
      to: authenticatedRole,
      as: "permissive",
      using: sql`${authUid} = ${table.user_id}`,
    }),
  ],
);
