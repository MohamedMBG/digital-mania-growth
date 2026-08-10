import { GrowthPlatform } from "@prisma/client";

/**
 * How a goal platform maps onto the delivery catalogue. `categorySlug` is the
 * catalogue category the audience number is bought from, so the assistant never
 * has to guess which service fulfils a goal.
 */
export type GrowthPlatformMapping = {
  platformSlug: string;
  categorySlug: string;
  audienceLabel: string;
  profileBaseUrl: string;
};

export const GROWTH_PLATFORM_MAPPINGS: Partial<
  Record<GrowthPlatform, GrowthPlatformMapping>
> = {
  [GrowthPlatform.instagram]: {
    platformSlug: "instagram",
    categorySlug: "followers",
    audienceLabel: "followers",
    profileBaseUrl: "https://instagram.com/",
  },
  [GrowthPlatform.tiktok]: {
    platformSlug: "tiktok",
    categorySlug: "followers",
    audienceLabel: "followers",
    profileBaseUrl: "https://tiktok.com/@",
  },
  [GrowthPlatform.youtube]: {
    platformSlug: "youtube",
    categorySlug: "subscribers",
    audienceLabel: "subscribers",
    profileBaseUrl: "https://youtube.com/",
  },
  [GrowthPlatform.facebook]: {
    platformSlug: "facebook",
    categorySlug: "likes",
    audienceLabel: "page likes",
    profileBaseUrl: "https://facebook.com/",
  },
  [GrowthPlatform.x]: {
    platformSlug: "twitter",
    categorySlug: "followers",
    audienceLabel: "followers",
    profileBaseUrl: "https://x.com/",
  },
  // LinkedIn has no catalogue equivalent, so those goals go to a human.
};

/** The customer wants to go ahead with the quote as it stands. */
export const CONFIRM_PATTERN =
  /\b(confirm|confirmed|i confirm|go ahead|proceed|yes please|let'?s go|start now|order now|d'?accord|oui|موافق|d3wa)\b/i;

/** The customer is asking what it costs. */
export const PRICE_PATTERN =
  /\b(price|pricing|cost|how much|quote|combien|prix|بكام|سعر)\b/i;

/** The customer wants a human instead of the assistant. */
export const HUMAN_PATTERN =
  /\b(human|real person|agent|manager|support team|someone real|parler[a-z ]*personne|شخص)\b/i;

/** The customer wants to stop or change the current quote. */
export const CANCEL_PATTERN =
  /\b(cancel|stop|abort|never ?mind|annuler|إلغاء)\b/i;
