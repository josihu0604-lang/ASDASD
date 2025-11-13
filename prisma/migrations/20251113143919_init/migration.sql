-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CREATOR', 'BUSINESS', 'ADMIN');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REWARDED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "QrScanResult" AS ENUM ('SUCCESS', 'ALREADY_USED', 'EXPIRED', 'INVALID');

-- CreateEnum
CREATE TYPE "WalletEntryType" AS ENUM ('REWARD', 'REDEEM', 'REFUND', 'BONUS');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "nickname" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CREATOR',
    "instagram_url" TEXT,
    "youtube_url" TEXT,
    "tiktok_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_geohash5" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "geohash6" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "phone" TEXT,
    "business_hour" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "qr_scanned_at" TIMESTAMP(3),
    "receipt_url" TEXT,
    "receipt_ocr_data" JSONB,
    "verified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_scans" (
    "id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "result" "QrScanResult" NOT NULL,
    "distance" INTEGER,
    "geohash5" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reels" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "caption" TEXT,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "geohash5" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "WalletEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "offer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "image_url" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "user_id" TEXT,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "geohash5" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_last_geohash5_idx" ON "users"("last_geohash5");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "magic_links_token_key" ON "magic_links"("token");

-- CreateIndex
CREATE INDEX "magic_links_email_idx" ON "magic_links"("email");

-- CreateIndex
CREATE INDEX "magic_links_token_idx" ON "magic_links"("token");

-- CreateIndex
CREATE INDEX "otp_codes_phone_idx" ON "otp_codes"("phone");

-- CreateIndex
CREATE INDEX "otp_codes_phone_code_idx" ON "otp_codes"("phone", "code");

-- CreateIndex
CREATE INDEX "places_geohash6_idx" ON "places"("geohash6");

-- CreateIndex
CREATE INDEX "offers_user_id_idx" ON "offers"("user_id");

-- CreateIndex
CREATE INDEX "offers_place_id_idx" ON "offers"("place_id");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_place_id_idx" ON "qr_codes"("place_id");

-- CreateIndex
CREATE INDEX "qr_codes_code_idx" ON "qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_scans_qr_code_id_idx" ON "qr_scans"("qr_code_id");

-- CreateIndex
CREATE INDEX "qr_scans_user_id_idx" ON "qr_scans"("user_id");

-- CreateIndex
CREATE INDEX "qr_scans_geohash5_idx" ON "qr_scans"("geohash5");

-- CreateIndex
CREATE INDEX "reels_user_id_idx" ON "reels"("user_id");

-- CreateIndex
CREATE INDEX "reels_offer_id_idx" ON "reels"("offer_id");

-- CreateIndex
CREATE INDEX "reels_geohash5_idx" ON "reels"("geohash5");

-- CreateIndex
CREATE INDEX "wallet_entries_user_id_idx" ON "wallet_entries"("user_id");

-- CreateIndex
CREATE INDEX "wallet_entries_offer_id_idx" ON "wallet_entries"("offer_id");

-- CreateIndex
CREATE INDEX "vouchers_user_id_idx" ON "vouchers"("user_id");

-- CreateIndex
CREATE INDEX "vouchers_status_idx" ON "vouchers"("status");

-- CreateIndex
CREATE INDEX "analytics_events_event_name_idx" ON "analytics_events"("event_name");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_geohash5_idx" ON "analytics_events"("geohash5");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scans" ADD CONSTRAINT "qr_scans_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reels" ADD CONSTRAINT "reels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reels" ADD CONSTRAINT "reels_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_entries" ADD CONSTRAINT "wallet_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
