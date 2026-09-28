import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  FeedbackChannel,
  Sentiment,
  FeedbackStatus,
} from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const feedbackTemplates = [
  {
    content:
      "The checkout process is confusing and I had trouble finding the payment button.",
    channel: FeedbackChannel.WEB,
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.82,
    featureArea: "Checkout",
  },
  {
    content:
      "I really like the new dashboard. The overview makes it easy to understand our performance.",
    channel: FeedbackChannel.WEB,
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.86,
    featureArea: "Dashboard",
  },
  {
    content: "The mobile app takes too long to load after opening it.",
    channel: FeedbackChannel.APP_STORE,
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.71,
    featureArea: "Mobile App",
  },
  {
    content:
      "Customer support resolved my issue quickly and kept me updated throughout.",
    channel: FeedbackChannel.SUPPORT,
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.79,
    featureArea: "Customer Support",
  },
  {
    content: "Please add an option to export reports as CSV.",
    channel: FeedbackChannel.SURVEY,
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: 0.02,
    featureArea: "Reports",
  },
  {
    content: "The latest update made the search feature much faster.",
    channel: FeedbackChannel.EMAIL,
    sentiment: Sentiment.POSITIVE,
    sentimentScore: 0.72,
    featureArea: "Search",
  },
  {
    content:
      "I received an error while trying to update my billing information.",
    channel: FeedbackChannel.WEB,
    sentiment: Sentiment.NEGATIVE,
    sentimentScore: -0.76,
    featureArea: "Billing",
  },
  {
    content:
      "The interface looks clean, but it would be useful to have more customization options.",
    channel: FeedbackChannel.SURVEY,
    sentiment: Sentiment.NEUTRAL,
    sentimentScore: 0.08,
    featureArea: "Customization",
  },
];

const customers = [
  "Acme Corp",
  "Northstar Labs",
  "BluePeak",
  "Vertex Systems",
  "Orbit Retail",
  "Summit Finance",
  "Nova Health",
  "Crestline",
];

async function main() {
  console.log("🌱 Starting LOOP seed...");

  // Create a real bcrypt hash for the demo password.
  const demoPasswordHash = await bcrypt.hash("LoopDemo@2026!", 12);

  // Clear existing seed data.
  await prisma.feedbackTheme.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // Create demo workspace.
  const workspace = await prisma.workspace.create({
    data: {
      name: "LOOP Demo Workspace",
    },
  });

  // Create the three required demo roles.
  await prisma.user.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: "LOOP Admin",
        email: "admin@loop-demo.com",
        passwordHash: demoPasswordHash,
        role: Role.ADMIN,
      },
      {
        workspaceId: workspace.id,
        name: "LOOP Analyst",
        email: "analyst@loop-demo.com",
        passwordHash: demoPasswordHash,
        role: Role.ANALYST,
      },
      {
        workspaceId: workspace.id,
        name: "LOOP Viewer",
        email: "viewer@loop-demo.com",
        passwordHash: demoPasswordHash,
        role: Role.VIEWER,
      },
    ],
  });

  // Create demo themes.
  const themeNames = [
    {
      name: "Checkout & Payments",
      description:
        "Issues and feedback related to checkout and payment flows.",
    },
    {
      name: "Mobile Experience",
      description:
        "Feedback about mobile application performance and usability.",
    },
    {
      name: "Customer Support",
      description:
        "Support quality, responsiveness, and resolution feedback.",
    },
    {
      name: "Dashboard & Analytics",
      description:
        "Feedback about dashboards, analytics, and reporting.",
    },
    {
      name: "Search & Discovery",
      description:
        "Feedback about search speed, relevance, and discovery.",
    },
    {
      name: "Billing",
      description:
        "Billing, invoices, and account payment management feedback.",
    },
    {
      name: "Customization",
      description:
        "Requests for personalization and configuration options.",
    },
  ];

  const themes = [];

  for (const theme of themeNames) {
    themes.push(
      await prisma.theme.create({
        data: {
          workspaceId: workspace.id,
          name: theme.name,
          description: theme.description,
        },
      }),
    );
  }

  // Create 120 realistic feedback records.
  const feedbackRecords = [];

  for (let i = 0; i < 120; i++) {
    const template = feedbackTemplates[i % feedbackTemplates.length];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i % 45));

    const feedback = await prisma.feedback.create({
      data: {
        workspaceId: workspace.id,
        content: template.content,
        channel: template.channel,
        customerLabel: customers[i % customers.length],
        sourceRef: `DEMO-${String(i + 1).padStart(4, "0")}`,
        sentiment: template.sentiment,
        sentimentScore: template.sentimentScore,
        featureArea: template.featureArea,
        status:
          i % 9 === 0
            ? FeedbackStatus.ACTIONED
            : i % 4 === 0
              ? FeedbackStatus.REVIEWED
              : FeedbackStatus.NEW,
        createdAt,
      },
    });

    feedbackRecords.push(feedback);
  }

  // Map feedback to themes.
  const themeMap = new Map(
    themes.map((theme) => [theme.name, theme.id]),
  );

  for (const feedback of feedbackRecords) {
    let themeName = "Dashboard & Analytics";

    if (
      feedback.featureArea === "Checkout" ||
      feedback.featureArea === "Payment"
    ) {
      themeName = "Checkout & Payments";
    } else if (feedback.featureArea === "Mobile App") {
      themeName = "Mobile Experience";
    } else if (feedback.featureArea === "Customer Support") {
      themeName = "Customer Support";
    } else if (feedback.featureArea === "Search") {
      themeName = "Search & Discovery";
    } else if (feedback.featureArea === "Billing") {
      themeName = "Billing";
    } else if (feedback.featureArea === "Customization") {
      themeName = "Customization";
    } else if (feedback.featureArea === "Reports") {
      themeName = "Dashboard & Analytics";
    }

    const themeId = themeMap.get(themeName);

    if (themeId) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId,
        },
      });
    }
  }

  console.log(`✅ Workspace created: ${workspace.name}`);
  console.log(`✅ Users created: 3`);
  console.log(`✅ Themes created: ${themes.length}`);
  console.log(`✅ Feedback records created: ${feedbackRecords.length}`);
  console.log("🌱 LOOP seed completed.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });