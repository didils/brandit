CREATE TYPE "public"."annuity_case_status" AS ENUM('active', 'lapsed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."annuity_payment_status" AS ENUM('unpaid', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."ip_type" AS ENUM('patent', 'design');--> statement-breakpoint
CREATE TABLE "annuity_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ip_type" "ip_type" NOT NULL,
	"registration_no" text NOT NULL,
	"title" text,
	"applicant" text,
	"application_no" text,
	"application_date" date,
	"registration_date" date,
	"expiry_date" date,
	"status" "annuity_case_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "annuity_cases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "annuity_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"annuity_year" integer NOT NULL,
	"due_date" date NOT NULL,
	"payment_status" "annuity_payment_status" DEFAULT 'unpaid' NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_date" date,
	"fee" integer,
	"payment_method" text,
	"payment_ref" text,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "annuity_payments_case_year_unique" UNIQUE("case_id","annuity_year"),
	CONSTRAINT "annuity_year_range" CHECK ("annuity_payments"."annuity_year" >= 4 AND "annuity_payments"."annuity_year" <= 20)
);
--> statement-breakpoint
ALTER TABLE "annuity_payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "annuity_cases" ADD CONSTRAINT "annuity_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annuity_payments" ADD CONSTRAINT "annuity_payments_case_id_annuity_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."annuity_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annuity_payments" ADD CONSTRAINT "annuity_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "select-annuity-cases-policy" ON "annuity_cases" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "annuity_cases"."user_id");--> statement-breakpoint
CREATE POLICY "insert-annuity-cases-policy" ON "annuity_cases" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "annuity_cases"."user_id");--> statement-breakpoint
CREATE POLICY "update-annuity-cases-policy" ON "annuity_cases" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "annuity_cases"."user_id") WITH CHECK ((select auth.uid()) = "annuity_cases"."user_id");--> statement-breakpoint
CREATE POLICY "delete-annuity-cases-policy" ON "annuity_cases" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "annuity_cases"."user_id");--> statement-breakpoint
CREATE POLICY "select-annuity-payments-policy" ON "annuity_payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) = "annuity_payments"."user_id");--> statement-breakpoint
CREATE POLICY "insert-annuity-payments-policy" ON "annuity_payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "annuity_payments"."user_id");--> statement-breakpoint
CREATE POLICY "update-annuity-payments-policy" ON "annuity_payments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = "annuity_payments"."user_id") WITH CHECK ((select auth.uid()) = "annuity_payments"."user_id");--> statement-breakpoint
CREATE POLICY "delete-annuity-payments-policy" ON "annuity_payments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = "annuity_payments"."user_id");