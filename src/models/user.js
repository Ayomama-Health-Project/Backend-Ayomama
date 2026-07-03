import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    lastPeriodDate: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      default: "",
    },

    preferredLanguages: {
      type: String,
      enum: ["en", "yo", "ig", "ha"],
      default: "en",
    },

    contact: {
      type: String,
      default: "",
    },

    emergencyContact: [
      {
        name: {
          type: String,
          default: "",
        },

        phone: {
          type: String,
          default: "",
        },

        email: {
          type: String,
          default: "",
        },

        relationship: {
          type: String,
          default: "",
        },
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },

    // OTP fields
    resetOTP: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema) 

const postPartumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    },
    emergencyContact: [
      {
        name: {
          type: String,
          default: ""
        },
        phoneNumber: {
          type: String,
          default: ""
        },
        relationship: {
          type: "String",
          default: ""
        }
      }
    ],
    babyAge: {
      type: String,
      required: false
    },
    babyDateOfBirth: {
      type: Date,
      default: "",
      required: false
    },
    babyBirthHospital: {
      type: String,
      default: "",
      required: false
    },
    babyImmunization: {
      type: Boolean,
      required: false
    },
    healthConcerns: {
      type: String,
      default: "",
      required: false
    },
    BirthWeight: {
      type: String,
      required: false
    },
    babyNickname: {
      type: String,
      default: "",
      required: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
  },{timestamps: true, versionKey: false}
)

export const PostPartum =  mongoose.model("PostPartum", postPartumSchema);
