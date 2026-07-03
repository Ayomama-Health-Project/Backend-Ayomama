import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
    name: {type: String, required: true},
    pregnancyStage: {type: String, required: false, default: ""},
    patientVisitDate: {type: Date, required: false},
    antinentalVisitDate: {type: Date, required: false},
    contact: {type: String, required: true},
    // chw: {type: mongoose.Schema.Types.ObjectId, ref: 'CHW', required: true},
    healthLogs: [{type: mongoose.Schema.Types.ObjectId, ref: 'HealthLog'}],
    visits: [{type: mongoose.Schema.Types.ObjectId, ref: 'CHWVisit'}],
    linkedHealthWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthWorkerProfile' },
},{timestamps: true})


export default mongoose.model('Patient', patientSchema);
