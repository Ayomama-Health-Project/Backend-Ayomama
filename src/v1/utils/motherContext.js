import Account from "../../models/Account.js";
import MotherProfile from "../../models/MotherProfile.js";
import PartnerProfile from "../../models/PartnerProfile.js";
import { env } from "../../config/env.js";

let groqGenerateText = null;
let groqModelFactory = null;

async function loadGroqTools() {
  if (groqGenerateText && groqModelFactory) {
    return { generateText: groqGenerateText, groq: groqModelFactory };
  }

  try {
    const [{ generateText }, { groq }] = await Promise.all([import("ai"), import("@ai-sdk/groq")]);
    groqGenerateText = generateText;
    groqModelFactory = groq;
    return { generateText, groq };
  } catch (_error) {
    return null;
  }
}

const DEFAULT_CHECKLIST = [
  { itemId: "supplement", label: "Take iron supplement", completed: false, iconKey: "ironSupplement" },
  { itemId: "water", label: "Drink 8 glasses of water", completed: false, iconKey: "water" },
  { itemId: "walk", label: "30 mins walk", completed: false, iconKey: "shoe" },
  { itemId: "clinic", label: "Schedule clinic visit", completed: false, iconKey: "clinic" },
];

const DEFAULT_REMINDERS = [
  { title: "Folic Acid", timeLabel: "09:30am", enabled: true },
  { title: "Prenatal Vitamins", timeLabel: "12:00pm", enabled: true },
  { title: "Iron", timeLabel: "02:00pm", enabled: false },
];

const DEFAULT_VITALS = {
  bloodPressure: "120/80 mmHg",
  weight: "65 kg",
  temperature: "36.8°C",
  bloodLevel: "12.5 g/dl",
};

const DEFAULT_WELLNESS = [
  { activityId: "yoga", title: "Prenatal Yoga", meta: "15 mins session", icon: "leaf-outline", enabled: true },
  { activityId: "breathing", title: "Breathing", meta: "5 mins exercise", icon: "body-outline", enabled: true },
  { activityId: "meditation", title: "Meditation", meta: "10 mins session", icon: "moon-outline", enabled: true },
  { activityId: "sleep", title: "Sleep Stories", meta: "15 mins session", icon: "bed-outline", enabled: true },
];

const DEFAULT_NUTRITION = [
  { category: "Breakfast", meal: "Pap, milk and eggs", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
  { category: "Lunch", meal: "Jollof rice, veggies and fish", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
  { category: "Dinner", meal: "Grilled fish and veggies", weight: "100g", macroA: "40g Protein", macroB: "15g Vitamin", macroC: "15g Fat" },
];

const DEFAULT_JOURNAL = [
  {
    body: "Today baby felt extra active after breakfast. I took time to breathe and slow down.",
    meta: "Yesterday's entry",
    createdAtLabel: "Yesterday",
  },
];

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(first, second) {
  if (!first || !second) return false;
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

function getPregnancyWeek(lastPeriodDate, dueDate, storedWeek) {
  if (typeof storedWeek === "number" && storedWeek > 0) {
    return storedWeek;
  }

  if (lastPeriodDate) {
    const diffMs = startOfDay(new Date()).getTime() - startOfDay(lastPeriodDate).getTime();
    return Math.max(1, Math.min(45, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1));
  }

  if (dueDate) {
    const diffMs = startOfDay(dueDate).getTime() - startOfDay(new Date()).getTime();
    return Math.max(1, Math.min(45, 40 - Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000))));
  }

  return 18;
}

function getPostpartumAgeWeeks(babyBirthDate) {
  if (!babyBirthDate) return 1;
  const diffMs = startOfDay(new Date()).getTime() - startOfDay(babyBirthDate).getTime();
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

function getPregnancyDevelopment(week) {
  const produce = [
    "a poppy seed",
    "a kidney bean",
    "a lime",
    "a bell pepper",
    "a papaya",
    "a pineapple",
    "a cabbage",
  ];
  const sizeComparison = produce[Math.min(produce.length - 1, Math.floor(week / 6))];

  return {
    stageLabel: `Week ${week}`,
    sizeComparison,
    headline: `Your baby is about the size of ${sizeComparison}.`,
    milestones: [
      "Your baby can now hear sounds.",
      "Tiny fingers and toes keep growing stronger.",
      "Daily movement is becoming more noticeable.",
    ],
    tips: [
      "Hydrate often and rest when your body asks for it.",
      "Keep up with your clinic visits and supplements.",
      "Take a gentle walk or stretch if you feel comfortable.",
    ],
  };
}

function getPostpartumDevelopment(weeks) {
  return {
    stageLabel: `Postpartum Week ${weeks}`,
    sizeComparison: "a growing newborn",
    headline: "Your baby is growing rapidly and your body is still recovering.",
    milestones: [
      "Feeding and sleep patterns are becoming more familiar.",
      "Your baby is gradually gaining strength and weight.",
      "Your own recovery still deserves rest, nutrition, and support.",
    ],
    tips: [
      "Prioritize rest and hydration whenever possible.",
      "Track feeding, diaper changes, and how you feel each day.",
      "Reach out for support if recovery feels physically or emotionally heavy.",
    ],
  };
}

function buildSupportTips({ motherType, babyName, stageLabel }) {
  const babyReference = babyName ? babyName : "baby";

  if (motherType === "postpartum") {
    return [
      `Check in on how both mum and ${babyReference} are coping today.`,
      "Create short rest windows so recovery feels more manageable.",
      "Help track feeds, diapers, and follow-up appointments together.",
    ];
  }

  return [
    `Ask how mum and ${babyReference} are feeling during ${stageLabel.toLowerCase()}.`,
    "Offer to help with meals, hydration, and clinic preparation today.",
    "Make space for rest and encourage her to speak up about discomfort early.",
  ];
}

function buildCommunityHighlights({ quickSetupSelections, supportCircle, stageLabel }) {
  const highlights = [];

  if (quickSetupSelections?.includes("community")) {
    highlights.push(`Other AYOMAMA mums are sharing ${stageLabel.toLowerCase()} experiences this week.`);
  }
  if (quickSetupSelections?.includes("health")) {
    highlights.push("Health tracking reminders are helping mums stay consistent with small daily wins.");
  }
  if (supportCircle?.length) {
    highlights.push(`Your support circle currently includes ${supportCircle.join(", ")}.`);
  }

  return highlights;
}

async function buildAiDevelopmentCopy({
  motherType,
  stageLabel,
  babyName,
  sizeComparison,
  pregnancyWeek,
  postpartumAgeWeeks,
}) {
  if (!env.groqApiKey) {
    return null;
  }

  const tools = await loadGroqTools();
  if (!tools) {
    return null;
  }

  try {
    const { text } = await tools.generateText({
      model: tools.groq("llama-3.1-8b-instant"),
      system:
        "You write warm, short maternal-health dashboard copy. Keep it factual, reassuring, and concise. Return plain JSON only.",
      prompt: JSON.stringify({
        motherType,
        stageLabel,
        babyName: babyName || "baby",
        sizeComparison,
        pregnancyWeek,
        postpartumAgeWeeks,
        requestedFields: ["headline", "milestones", "tips"],
      }),
      temperature: 0.4,
      maxTokens: 220,
    });

    const parsed = JSON.parse(text);
    if (!parsed?.headline || !Array.isArray(parsed?.milestones) || !Array.isArray(parsed?.tips)) {
      return null;
    }

    return {
      headline: parsed.headline,
      milestones: parsed.milestones.slice(0, 3),
      tips: parsed.tips.slice(0, 3),
    };
  } catch (_error) {
    return null;
  }
}

export async function getLinkedMotherAccountId(account) {
  if (account.role === "mother") return account._id;
  if (account.role !== "partner") return null;

  const partnerProfile = await PartnerProfile.findOne({ account: account._id }).lean();
  return partnerProfile?.linkedMotherAccount || null;
}

export async function buildMotherContext(account) {
  const motherAccountId = await getLinkedMotherAccountId(account);
  if (!motherAccountId) return null;

  const [motherProfile, motherAccount] = await Promise.all([
    MotherProfile.findOne({ account: motherAccountId }).lean(),
    Account.findById(motherAccountId).lean(),
  ]);
  if (!motherProfile || !motherAccount) return null;

  const today = startOfDay(new Date());
  let checklistItems =
    motherProfile.checklistItems?.length > 0 ? motherProfile.checklistItems : DEFAULT_CHECKLIST;

  if (!isSameDay(motherProfile.checklistLastResetAt, today)) {
    checklistItems = checklistItems.map((item) => ({ ...item, completed: false }));
    await MotherProfile.updateOne(
      { account: motherAccountId },
      {
        $set: {
          checklistItems,
          checklistLastResetAt: today,
        },
      },
    );
  }

  const pregnancyWeek = getPregnancyWeek(
    motherProfile.lastPeriodDate,
    motherProfile.dueDate,
    motherProfile.pregnancyWeek,
  );
  const postpartumAgeWeeks = getPostpartumAgeWeeks(motherProfile.babyBirthDate);
  const development =
    motherAccount.motherType === "postpartum" || motherProfile.babyBirthDate
      ? getPostpartumDevelopment(postpartumAgeWeeks)
      : getPregnancyDevelopment(pregnancyWeek);
  const aiDevelopmentCopy = await buildAiDevelopmentCopy({
    motherType: motherAccount.motherType,
    stageLabel: development.stageLabel,
    babyName: motherProfile.babyName || motherProfile.babyNickname,
    sizeComparison: development.sizeComparison,
    pregnancyWeek,
    postpartumAgeWeeks,
  });
  const babyDisplayName = motherProfile.babyName || motherProfile.babyNickname || "your baby";
  const resolvedDevelopmentSnapshot =
    motherProfile.developmentSnapshot?.headline
      ? motherProfile.developmentSnapshot
      : {
          ...development,
          ...(aiDevelopmentCopy || {}),
          headline:
            aiDevelopmentCopy?.headline ||
            `${babyDisplayName} is about the size of ${development.sizeComparison}.`,
          updatedAt: new Date(),
        };

  return {
    motherAccountId: motherAccountId.toString(),
    motherType: motherAccount.motherType,
    dueDate: motherProfile.dueDate,
    lastPeriodDate: motherProfile.lastPeriodDate,
    babyBirthDate: motherProfile.babyBirthDate,
    babyBirthHospital: motherProfile.babyBirthHospital,
    babyName: motherProfile.babyName || "",
    babyNickname: motherProfile.babyNickname || "",
    babyDisplayName,
    emergencyContacts: motherProfile.emergencyContacts || [],
    supportCircle: motherProfile.supportCircle || [],
    quickSetupSelections: motherProfile.quickSetupSelections || [],
    pregnancyWeek,
    postpartumAgeWeeks,
    checklistItems,
    medicationReminders:
      motherProfile.medicationReminders?.length > 0
        ? motherProfile.medicationReminders
        : DEFAULT_REMINDERS,
    vitalsOverview:
      motherProfile.vitalsOverview?.bloodPressure
        ? motherProfile.vitalsOverview
        : { ...DEFAULT_VITALS, updatedAt: new Date() },
    wellnessActivities:
      motherProfile.wellnessActivities?.length > 0
        ? motherProfile.wellnessActivities
        : DEFAULT_WELLNESS,
    nutritionPlan:
      motherProfile.nutritionPlan?.length > 0 ? motherProfile.nutritionPlan : DEFAULT_NUTRITION,
    journalEntries:
      motherProfile.journalEntries?.length > 0 ? motherProfile.journalEntries : DEFAULT_JOURNAL,
    supportTips: buildSupportTips({
      motherType: motherAccount.motherType,
      babyName: motherProfile.babyName || motherProfile.babyNickname,
      stageLabel: development.stageLabel,
    }),
    communityHighlights: buildCommunityHighlights({
      quickSetupSelections: motherProfile.quickSetupSelections,
      supportCircle: motherProfile.supportCircle,
      stageLabel: development.stageLabel,
    }),
    developmentSnapshot: resolvedDevelopmentSnapshot,
  };
}
