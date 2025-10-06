import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    pregnancyStage: {type: String, required: true},
    patientVisitDate: {type: Date, required: true},
    antinentalVisitDate: {type: Date, required: true},
    contact: {type: String, required: true},
    chw: {type: mongoose.Schema.Types.ObjectId, ref: 'CHW', required: true},
    healthLogs: [{type: mongoose.Schema.Types.ObjectId, ref: 'HealthLog'}],
    visits: [{type: mongoose.Schema.Types.ObjectId, ref: 'CHWVisit'}]
},{timestamps: true})


export default mongoose.model('Patient', patientSchema);
