import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const platformSeeds = [
  { id: "platform-instagram", name: "Instagram", slug: "instagram", icon: "instagram", sortOrder: 1 },
  { id: "platform-tiktok", name: "TikTok", slug: "tiktok", icon: "music4", sortOrder: 2 },
  { id: "platform-youtube", name: "YouTube", slug: "youtube", icon: "youtube", sortOrder: 3 },
  { id: "platform-twitter", name: "Twitter", slug: "twitter", icon: "twitter", sortOrder: 4 },
  { id: "platform-spotify", name: "Spotify", slug: "spotify", icon: "music2", sortOrder: 5 },
  { id: "platform-facebook", name: "Facebook", slug: "facebook", icon: "facebook", sortOrder: 6 },
  { id: "platform-telegram", name: "Telegram", slug: "telegram", icon: "send", sortOrder: 7 },
];

const categorySeeds = [
  { id: "cat-instagram-followers", platformId: "platform-instagram", name: "Followers", slug: "followers", sortOrder: 1 },
  { id: "cat-instagram-likes", platformId: "platform-instagram", name: "Likes", slug: "likes", sortOrder: 2 },
  { id: "cat-instagram-views", platformId: "platform-instagram", name: "Views", slug: "views", sortOrder: 3 },
  { id: "cat-tiktok-followers", platformId: "platform-tiktok", name: "Followers", slug: "followers", sortOrder: 1 },
  { id: "cat-tiktok-views", platformId: "platform-tiktok", name: "Views", slug: "views", sortOrder: 2 },
  { id: "cat-tiktok-likes", platformId: "platform-tiktok", name: "Likes", slug: "likes", sortOrder: 3 },
  { id: "cat-youtube-views", platformId: "platform-youtube", name: "Views", slug: "views", sortOrder: 1 },
  { id: "cat-youtube-likes", platformId: "platform-youtube", name: "Likes", slug: "likes", sortOrder: 2 },
  { id: "cat-youtube-subscribers", platformId: "platform-youtube", name: "Subscribers", slug: "subscribers", sortOrder: 3 },
  { id: "cat-twitter-followers", platformId: "platform-twitter", name: "Followers", slug: "followers", sortOrder: 1 },
  { id: "cat-twitter-likes", platformId: "platform-twitter", name: "Likes", slug: "likes", sortOrder: 2 },
  { id: "cat-spotify-plays", platformId: "platform-spotify", name: "Plays", slug: "plays", sortOrder: 1 },
  { id: "cat-spotify-followers", platformId: "platform-spotify", name: "Followers", slug: "followers", sortOrder: 2 },
  { id: "cat-facebook-likes", platformId: "platform-facebook", name: "Likes", slug: "likes", sortOrder: 1 },
  { id: "cat-telegram-members", platformId: "platform-telegram", name: "Members", slug: "members", sortOrder: 1 },
];

const serviceSeeds = [
  { id: "ig-followers-1", platformId: "platform-instagram", categoryId: "cat-instagram-followers", name: "Instagram Followers", slug: "instagram-followers", providerServiceId: "1001", description: "High-quality Instagram followers from real accounts. Boost your profile credibility and social proof instantly.", shortDescription: "Real followers for steady account growth.", pricePerK: "4.99", minOrder: 100, maxOrder: 100000, deliverySpeed: "0-2 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: true, sortOrder: 1 },
  { id: "ig-likes-1", platformId: "platform-instagram", categoryId: "cat-instagram-likes", name: "Instagram Likes", slug: "instagram-likes", providerServiceId: "1002", description: "Real Instagram likes to boost your post engagement. Fast delivery with natural-looking growth.", shortDescription: "Fast likes for stronger social proof.", pricePerK: "2.99", minOrder: 50, maxOrder: 50000, deliverySpeed: "0-1 hour", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: true, sortOrder: 2 },
  { id: "ig-views-1", platformId: "platform-instagram", categoryId: "cat-instagram-views", name: "Instagram Reels Views", slug: "instagram-reels-views", providerServiceId: "1003", description: "Increase your Reels views and reach a wider audience. Real views from active users.", shortDescription: "High-volume reel views with quick start.", pricePerK: "1.99", minOrder: 500, maxOrder: 1000000, deliverySpeed: "0-30 min", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: true, sortOrder: 3 },
  { id: "tt-followers-1", platformId: "platform-tiktok", categoryId: "cat-tiktok-followers", name: "TikTok Followers", slug: "tiktok-followers", providerServiceId: "2001", description: "Grow your TikTok following with real, active followers. Build your audience quickly.", shortDescription: "Follower growth for TikTok creators.", pricePerK: "5.99", minOrder: 100, maxOrder: 50000, deliverySpeed: "0-4 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: true, sortOrder: 1 },
  { id: "tt-views-1", platformId: "platform-tiktok", categoryId: "cat-tiktok-views", name: "TikTok Views", slug: "tiktok-views", providerServiceId: "2002", description: "Boost your TikTok video views. Get your content trending with high-quality views.", shortDescription: "Scale views for trending velocity.", pricePerK: "1.49", minOrder: 500, maxOrder: 5000000, deliverySpeed: "0-15 min", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: true, sortOrder: 2 },
  { id: "tt-likes-1", platformId: "platform-tiktok", categoryId: "cat-tiktok-likes", name: "TikTok Likes", slug: "tiktok-likes", providerServiceId: "2003", description: "Get TikTok likes to improve your engagement rate and visibility.", shortDescription: "Engagement boost for videos that need momentum.", pricePerK: "2.49", minOrder: 50, maxOrder: 100000, deliverySpeed: "0-1 hour", guarantee: "30-day guarantee", refillPolicy: "Auto-refill available", isFeatured: false, sortOrder: 3 },
  { id: "yt-views-1", platformId: "platform-youtube", categoryId: "cat-youtube-views", name: "YouTube Views", slug: "youtube-views", providerServiceId: "3001", description: "High-retention YouTube views to boost your video rankings and visibility.", shortDescription: "Retention-focused views for ranking signals.", pricePerK: "6.99", minOrder: 500, maxOrder: 1000000, deliverySpeed: "0-12 hours", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: true, sortOrder: 1 },
  { id: "yt-likes-1", platformId: "platform-youtube", categoryId: "cat-youtube-likes", name: "YouTube Likes", slug: "youtube-likes", providerServiceId: "3002", description: "Authentic YouTube likes to improve your video engagement signals.", shortDescription: "Likes that strengthen engagement signals.", pricePerK: "8.99", minOrder: 50, maxOrder: 50000, deliverySpeed: "0-6 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 2 },
  { id: "yt-subs-1", platformId: "platform-youtube", categoryId: "cat-youtube-subscribers", name: "YouTube Subscribers", slug: "youtube-subscribers", providerServiceId: "3003", description: "Grow your YouTube channel with real subscribers. Build your community faster.", shortDescription: "Subscriber growth for channel momentum.", pricePerK: "14.99", minOrder: 100, maxOrder: 100000, deliverySpeed: "0-24 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 3 },
  { id: "tw-followers-1", platformId: "platform-twitter", categoryId: "cat-twitter-followers", name: "Twitter Followers", slug: "twitter-followers", providerServiceId: "4001", description: "Boost your Twitter presence with real followers. Increase your influence.", shortDescription: "Audience growth for X/Twitter profiles.", pricePerK: "7.99", minOrder: 100, maxOrder: 50000, deliverySpeed: "0-6 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 1 },
  { id: "tw-likes-1", platformId: "platform-twitter", categoryId: "cat-twitter-likes", name: "Twitter Likes", slug: "twitter-likes", providerServiceId: "4002", description: "Get Twitter likes on your tweets. Boost engagement and visibility.", shortDescription: "Likes for better tweet reach.", pricePerK: "3.99", minOrder: 50, maxOrder: 50000, deliverySpeed: "0-2 hours", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: false, sortOrder: 2 },
  { id: "sp-plays-1", platformId: "platform-spotify", categoryId: "cat-spotify-plays", name: "Spotify Plays", slug: "spotify-plays", providerServiceId: "5001", description: "Increase your Spotify streams with real plays. Boost your artist ranking.", shortDescription: "Streaming volume for artist growth.", pricePerK: "3.49", minOrder: 1000, maxOrder: 1000000, deliverySpeed: "0-12 hours", guarantee: "Lifetime guarantee", refillPolicy: "No refill needed", isFeatured: true, sortOrder: 1 },
  { id: "sp-followers-1", platformId: "platform-spotify", categoryId: "cat-spotify-followers", name: "Spotify Followers", slug: "spotify-followers", providerServiceId: "5002", description: "Grow your Spotify followers and increase your monthly listeners.", shortDescription: "Build follower momentum for music releases.", pricePerK: "5.99", minOrder: 100, maxOrder: 100000, deliverySpeed: "0-24 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 2 },
  { id: "fb-followers-1", platformId: "platform-facebook", categoryId: "cat-facebook-likes", name: "Facebook Page Likes", slug: "facebook-page-likes", providerServiceId: "6001", description: "Boost your Facebook page with real page likes. Increase your brand authority.", shortDescription: "Page likes for stronger brand presence.", pricePerK: "9.99", minOrder: 100, maxOrder: 50000, deliverySpeed: "0-12 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 1 },
  { id: "tg-members-1", platformId: "platform-telegram", categoryId: "cat-telegram-members", name: "Telegram Members", slug: "telegram-members", providerServiceId: "7001", description: "Grow your Telegram group or channel with real members. Build your community.", shortDescription: "Member growth for channels and communities.", pricePerK: "4.49", minOrder: 100, maxOrder: 100000, deliverySpeed: "0-6 hours", guarantee: "30-day guarantee", refillPolicy: "Auto-refill for 30 days", isFeatured: false, sortOrder: 1 },
];

async function main() {
  for (const platform of platformSeeds) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: {
        name: platform.name,
        icon: platform.icon,
        sortOrder: platform.sortOrder,
        isActive: true,
      },
      create: platform,
    });
  }

  for (const category of categorySeeds) {
    await prisma.category.upsert({
      where: {
        platformId_slug: {
          platformId: category.platformId,
          slug: category.slug,
        },
      },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: category,
    });
  }

  for (const service of serviceSeeds) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        slug: service.slug,
        providerServiceId: service.providerServiceId,
        description: service.description,
        shortDescription: service.shortDescription,
        pricePerK: service.pricePerK,
        minOrder: service.minOrder,
        maxOrder: service.maxOrder,
        deliverySpeed: service.deliverySpeed,
        guarantee: service.guarantee,
        refillPolicy: service.refillPolicy,
        isFeatured: service.isFeatured,
        isActive: true,
        sortOrder: service.sortOrder,
        platformId: service.platformId,
        categoryId: service.categoryId,
      },
      create: service,
    });
  }

  console.log("Seed completed successfully.");
}

void main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
