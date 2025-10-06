import mongoose from 'mongoose'

const chwSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: ""
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String
    },
    state: {
        type: String
    },
    localGovernment: {
        type: String,
    },
    facilityName: {
        type: String
    },
    facilityCode: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    AssignedPatients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    }],
},
{timestamp: true}
)

export default mongoose.model("CHW", chwSchema)