import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true},
    pregnancyStage: {type: String, required: true},
    visitDate: {type: Date, required: true},
    medicationInfo: {
        medicationName: {type: String, required: false},
        dosage: {type: String, required: false},
        frequency: {type: String, required: false},
        route: {type: String, required: false},
        status: {type: String, enum: ["active", "completed", "discontinued"], required: false},
        startDate: {type: Date, required: false},
        endDate: {type: Date, required: false},
        Notes: {type: String, required: false},
    },
    riskStatus: {type: String, enum: ["safe","monitor","urgent" ], required: true},
    medicalHistory: {type: String, required: true},
    // Patient information can be a JSON string containing details like temperature, weight, blood level, blood pressure, etc.
    patientInformation: {
        temperature: {type: Number, required: true},
        weight: {type: Number, required: true},
        bloodLevel: {type: Number, required: true},
        bloodPressure: {type: String, required: true},
    },
    ward: {type: String, required: false}
},{timestamps: true});


export default mongoose.model('HealthLog', healthLogSchema)