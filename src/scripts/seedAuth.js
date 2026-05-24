import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { env } from "../config/env.js";
import connectDB from "../utils/db.js";
import Account from "../models/Account.js";
import AdminProfile from "../models/AdminProfile.js";
import Appointment from "../models/Appointment.js";
import HealthWorkerProfile from "../models/HealthWorkerProfile.js";
import BlogPost from "../models/BlogPost.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityThread from "../models/CommunityThread.js";
import HealthWorkerFollow from "../models/HealthWorkerFollow.js";
import MotherProfile from "../models/MotherProfile.js";
import PartnerProfile from "../models/PartnerProfile.js";

async function createDefaultData() {
  await Account.deleteMany({});
  await AdminProfile.deleteMany({});
  await HealthWorkerProfile.deleteMany({});
  await BlogPost.deleteMany({});
  await CommunityPost.deleteMany({});
  await CommunityThread.deleteMany({});
  await HealthWorkerFollow.deleteMany({});
  await MotherProfile.deleteMany({});
  await PartnerProfile.deleteMany({});
  await Appointment.deleteMany({});

  const superAdmin = await Account.create({
    email: "super@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "super_admin",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await AdminProfile.create({
    account: superAdmin._id,
    fullName: "AYOMAMA Super Admin",
    adminRole: "super_admin",
    permissions: ["admins:write", "admins:read", "accounts:status"],
  });

  const mother = await Account.create({
    email: "mother@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "mother",
    motherType: "pregnant",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await MotherProfile.create({
    account: mother._id,
    fullName: "Sample Mother",
    phoneNumber: "+2348000000000",
    emergencyContacts: [
      { name: "General Hospital Lagos", phoneNumber: "+2348000001001", relationship: "hospital" },
      { name: "Daniel", phoneNumber: "+2348000001002", relationship: "partner" },
      { name: "Mummy Kemi", phoneNumber: "+2348000001003", relationship: "family" },
    ],
    dueDate: new Date(Date.now() + 22 * 7 * 24 * 60 * 60 * 1000),
    lastPeriodDate: new Date(Date.now() - 18 * 7 * 24 * 60 * 60 * 1000),
    babyName: "Ayo",
    babyNickname: "Little Ayo",
    supportCircle: ["partner"],
    quickSetupSelections: ["health", "community", "emergency"],
    checklistItems: [
      { itemId: "supplement", label: "Take iron supplement", completed: true, iconKey: "ironSupplement" },
      { itemId: "water", label: "Drink 8 glasses of water", completed: false, iconKey: "water" },
      { itemId: "walk", label: "30 mins walk", completed: false, iconKey: "shoe" },
      { itemId: "clinic", label: "Schedule clinic visit", completed: true, iconKey: "clinic" },
    ],
    medicationReminders: [
      {
        title: "Folic Acid",
        dosage: "1 tablet daily",
        timeLabel: "09:30 am",
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        enabled: true,
      },
      {
        title: "Prenatal Vitamins",
        dosage: "1 tablet after lunch",
        timeLabel: "12:00 pm",
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        enabled: true,
      },
    ],
    vitalsOverview: {
      bloodPressure: "118/76 mmHg",
      weight: "68 kg",
      temperature: "36.7°C",
      bloodLevel: "12.8 g/dl",
      updatedAt: new Date(),
    },
    wellnessActivities: [
      { activityId: "yoga", title: "Prenatal Yoga", meta: "15 mins session", icon: "leaf-outline", enabled: true },
      { activityId: "breathing", title: "Breathing", meta: "5 mins exercise", icon: "body-outline", enabled: true },
      { activityId: "meditation", title: "Meditation", meta: "10 mins session", icon: "moon-outline", enabled: true },
      { activityId: "sleep", title: "Sleep Stories", meta: "15 mins session", icon: "bed-outline", enabled: true },
    ],
    nutritionPlan: [
      { category: "Breakfast", meal: "Pap, milk and eggs", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
      { category: "Lunch", meal: "Jollof rice, veggies and fish", weight: "100g", macroA: "40g Protein", macroB: "15g Fat", macroC: "45g Carbs" },
      { category: "Dinner", meal: "Grilled fish and veggies", weight: "100g", macroA: "40g Protein", macroB: "15g Vitamin", macroC: "15g Fat" },
    ],
    journalEntries: [
      {
        body: "Today baby felt extra active after breakfast. I took time to breathe and slow down.",
        meta: "Yesterday's entry",
        createdAtLabel: "Yesterday",
      },
    ],
  });

  const partner = await Account.create({
    email: "partner@gmail.com",
    passwordHash: await bcrypt.hash("password12", 10),
    role: "partner",
    status: "active",
    onboardingCompleted: true,
    isEmailVerified: true,
  });
  await PartnerProfile.create({
    account: partner._id,
    fullName: "Sample Partner",
    phoneNumber: "+2348000000008",
    linkedMotherAccount: mother._id,
    relationshipLabel: "Partner",
    inviteAcceptedAt: new Date(),
  });

  await Appointment.insertMany([
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Antenatal Checkup",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dr. Aishat Bello",
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      notes: "Bring scan record and blood work results.",
      checklist: ["Health card", "Water bottle", "Questions for doctor"],
      status: "scheduled",
    },
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Scan Review",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dr. Aishat Bello",
      scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 40,
      notes: "Bring your last scan images and questions.",
      checklist: ["Scan record", "Water bottle"],
      status: "scheduled",
    },
    {
      account: mother._id,
      ownerMotherAccount: mother._id,
      serviceType: "Nutrition Review",
      hospitalName: "General Hospital Lagos",
      healthcareProvider: "Dietician Tolu",
      scheduledFor: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      durationMinutes: 30,
      notes: "Review meal plan and supplements.",
      checklist: ["Food diary", "Supplement list"],
      status: "scheduled",
    },
  ]);

  const seededHealthWorkers = [
    {
      email: "worker1@gmail.com",
      fullName: "Nurse Aishat Bello",
      healthWorkerType: "with_clinic",
      occupation: "Midwife",
      facilityName: "Lagos Women Care Clinic",
      facilityCode: "LWC-101",
      state: "Lagos",
      localGovernment: "Ikeja",
      phoneNumber: "+2348000000101",
    },
    {
      email: "worker2@gmail.com",
      fullName: "Dr Tolu Adeyemi",
      healthWorkerType: "with_clinic",
      occupation: "Obstetrician",
      facilityName: "Sunrise Maternity Centre",
      facilityCode: "SMC-214",
      state: "Oyo",
      localGovernment: "Ibadan North",
      phoneNumber: "+2348000000102",
    },
    {
      email: "worker3@gmail.com",
      fullName: "Grace Nwosu",
      healthWorkerType: "without_clinic",
      occupation: "Community Health Worker",
      facilityName: "",
      facilityCode: "",
      state: "Enugu",
      localGovernment: "Enugu North",
      phoneNumber: "+2348000000103",
    },
    {
      email: "worker4@gmail.com",
      fullName: "Binta Yusuf",
      healthWorkerType: "without_clinic",
      occupation: "Nurse Educator",
      facilityName: "",
      facilityCode: "",
      state: "Kaduna",
      localGovernment: "Zaria",
      phoneNumber: "+2348000000104",
    },
    {
      email: "worker5@gmail.com",
      fullName: "Dr Chiamaka Okafor",
      healthWorkerType: "with_clinic",
      occupation: "Pediatric Nurse",
      facilityName: "Bloom Family Health",
      facilityCode: "BFH-330",
      state: "Abuja",
      localGovernment: "Gwarinpa",
      phoneNumber: "+2348000000105",
    },
  ];

  for (const worker of seededHealthWorkers) {
    const account = await Account.create({
      email: worker.email,
      passwordHash: await bcrypt.hash("password12", 10),
      role: "health_worker",
      healthWorkerType: worker.healthWorkerType,
      status: "active",
      onboardingCompleted: true,
      isEmailVerified: true,
    });

    await HealthWorkerProfile.create({
      account: account._id,
      fullName: worker.fullName,
      phoneNumber: worker.phoneNumber,
      state: worker.state,
      localGovernment: worker.localGovernment,
      occupation: worker.occupation,
      facilityName: worker.facilityName,
      facilityCode: worker.facilityCode,
    });
  }

  const allHealthWorkerAccounts = await Account.find({ role: "health_worker" }).lean();
  const featuredWorker = allHealthWorkerAccounts[0];

  if (featuredWorker) {
    await HealthWorkerFollow.create({
      followerAccount: mother._id,
      healthWorkerAccount: featuredWorker._id,
    });

    await CommunityPost.insertMany([
      {
        authorAccount: mother._id,
        content: "Baby has been moving a lot this week and I’m feeling more hopeful. How are other mums managing evening discomfort?",
        likes: [partner._id],
        comments: [
          {
            authorAccount: featuredWorker._id,
            content: "Gentle stretches and earlier hydration can help a lot. Please mention any persistent pain at your next clinic visit.",
            replies: [
              {
                authorAccount: mother._id,
                content: "Thank you, I’ll try that tonight.",
              },
            ],
          },
        ],
      },
      {
        authorAccount: partner._id,
        content: "Any good ways partners can help mums prepare better for clinic days without adding stress?",
        likes: [mother._id],
        comments: [],
      },
    ]);

    await CommunityThread.create({
      title: "Nurse Aishat Bello",
      participantAccounts: [mother._id, featuredWorker._id],
      targetHealthWorkerAccount: featuredWorker._id,
      latestMessageAt: new Date(),
      messages: [
        {
          senderAccount: mother._id,
          content: "Hello nurse, I have been feeling more tired in the evenings lately.",
        },
        {
          senderAccount: featuredWorker._id,
          content: "Hello dear. Please keep hydrating well and rest more. If it worsens, let your clinic know.",
        },
      ],
    });
  }

  await BlogPost.insertMany([
    {
      title: "5 Essential Nutrients for a Healthy Pregnancy",
      slug: "5-essential-nutrients-for-a-healthy-pregnancy",
      excerpt: "Discover the key nutrients every expecting mother needs this trimester.",
      content: "A healthy pregnancy needs a practical balance of iron, folate, calcium, hydration, and protein.",
      coverImage:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      category: "Nutrition",
      language: "en",
      status: "published",
      authorAccount: superAdmin._id,
      publishedAt: new Date(),
      reads: 1243,
    },
    {
      title: "How to Build a Rest Routine That Works for You",
      slug: "how-to-build-a-rest-routine-that-works-for-you",
      excerpt: "A gentle bedtime flow can improve energy, sleep quality, and mood.",
      content: "A calmer evening routine can reduce physical stress and help you recover more deeply overnight.",
      coverImage:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
      category: "Wellbeing",
      language: "en",
      status: "published",
      authorAccount: superAdmin._id,
      publishedAt: new Date(),
      reads: 897,
    },
  ]);
}

async function main() {
  await connectDB();
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question(
      `Connected to ${env.mongoUri}. Clear auth collections and seed default accounts? (y/N): `,
    );

    const normalizedAnswer = answer.trim().toLowerCase();

    if (normalizedAnswer !== "y" && normalizedAnswer !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }

    await createDefaultData();
    console.log("Auth seed complete.");
    process.exit(0);
  } catch (error) {
    if (error?.code === "ABORT_ERR") {
      console.log("\nSeed cancelled.");
      process.exit(0);
    }

    throw error;
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
