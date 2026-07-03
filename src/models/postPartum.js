import mongoose from 'mongoose'

const motherVitalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostPartum",
        required: true
    },
    bloodPressure: {
        type: String,
        required: true
    },
    temperature: {
        type: String,
        required: true

    },
    weight: {
        type: String,
        required: true
    },
    bloodLevel: {
        type: String,
        required: true
    },
    motherMood: {
        type: String,
        required: false
    },
    symptoms: {
        type: String,
        required: false
    },
    meal: [
        {
            mealType: {
                type: String,
                enum: ["breakfast", "lunch", "dinner"],
                required: true
            },
            mealDescription: {
                type: String,
                required: true
            },
            mealWeight: {
                type: String,
                required: true
            }
        }
    ]
},
{timestamps: true, versionKey: false}
);

export const motherVital = mongoose.model("MotherVital", motherVitalSchema);

const babySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostPartum",
        required: true
    },
    babyTracker: [
        {
            babyWeight: {
                type: String,
                required: true
            },
            babyHeight: {
                type: String,
                required: true
            },
            babyFeedingRemainder: [
                {
                    lastFeedingTime: {
                        type: Date,
                        required: true
                    },
                    nextFeedingTime: {
                        type: Date,
                        required: true
                    }
                }
            ],
            babyDiaperChangeRemainder: [
                {
                    lastDiaperChangeTime: {
                        type: Date,
                        required: true
                    },
                    nextDiaperChangeTime: {
                        type: Date,
                        required: true
                    }
                }
            ]
        }
    ],
    babyImmunization: [
        {
            immunizationName: {
                type: String,
                required: true
            },
            immunizationDate: {
                type: Date,
                required: true
            },
            immunizationDueDateInWeeks: {
                type: Number,
                required: true
            },
            immunizationStatus: {
                type: String,
                enum: ["pending", "completed"],
                required: true
            }
        }
    ]
}, {timestamps: true, versionKey: false});

export const Baby = mongoose.model("Baby", babySchema);