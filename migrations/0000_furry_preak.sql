CREATE TYPE "public"."product_status" AS ENUM('created', 'in_production', 'quality_check', 'in_transit', 'delivered', 'sold');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'verified', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('farmer', 'distributor', 'retailer', 'consumer', 'inspector');--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"product_type" varchar NOT NULL,
	"batch_number" varchar NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" varchar NOT NULL,
	"origin_farm_id" varchar NOT NULL,
	"harvest_date" timestamp,
	"expiry_date" timestamp,
	"status" "product_status" DEFAULT 'created' NOT NULL,
	"qr_code" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_batch_number_unique" UNIQUE("batch_number"),
	CONSTRAINT "products_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_chain_stages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"stage_name" varchar NOT NULL,
	"stage_type" varchar NOT NULL,
	"handler_id" varchar NOT NULL,
	"location" varchar,
	"timestamp" timestamp DEFAULT now(),
	"notes" text,
	"verification_data" jsonb,
	"status" varchar DEFAULT 'completed'
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"from_user_id" varchar NOT NULL,
	"to_user_id" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"price" numeric(10, 2),
	"currency" varchar DEFAULT 'USD',
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"blockchain_hash" varchar,
	"verification_signature" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" "user_role" DEFAULT 'consumer' NOT NULL,
	"company_name" varchar,
	"location" varchar,
	"verification_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"verifier_id" varchar NOT NULL,
	"verification_type" varchar NOT NULL,
	"result" varchar NOT NULL,
	"certificate_url" varchar,
	"notes" text,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");