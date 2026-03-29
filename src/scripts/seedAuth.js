import bcrypt from "bcryptjs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { env } from "../config/env.js";
import connectDB from "../utils/db.js";
import Account from "../models/Account.js";
import AdminProfile from "../models/AdminProfile.js";
import HealthWorkerProfile from "../models/HealthWorkerProfile.js";
import MotherProfile from "../models/MotherProfile.js";
import PartnerProfile from "../models/PartnerProfile.js";

async function createDefaultData() {
  await Account.deleteMany({});
  await AdminProfile.deleteMany({});
  await HealthWorkerProfile.deleteMany({});
  await MotherProfile.deleteMany({});
  await PartnerProfile.deleteMany({});

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
    linkedMotherAccount: mother._id,
    relationshipLabel: "Partner",
    inviteAcceptedAt: new Date(),
  });

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
