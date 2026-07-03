import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true},
    pregnancyStage: {type: String, required: true},
    visitDate: {type: Date, required: true},
    medicationList: {type: String, required: true},
    riskStatus: {type: String, enum: ["safe","monitor","urgent" ], required: true},
    medicalHistory: {type: String, required: true},
    patientInformation: {type: String, required: true}
},{timestamps: true});

export default mongoose.model('HealthLog', healthLogSchema)