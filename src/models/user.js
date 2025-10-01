import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
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
        phone: {
            type: String,
        },
        preferredLanguages: {
            type: String,
            enum: ["en", "yo", "ig", "ha"],
            default: "en"
        },
        emergencyContact: [
            {
                name: String,
                phone: String,
                email: String,
                relationship: String
            }
        ],
    },
    {timestamp: true}
);

export default mongoose.model("User", userSchema);