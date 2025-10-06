import mongoose from 'mongoose';

const chwVisitSchema = new mongoose.Schema({
    chwId: {type: mongoose.Schema.Types.ObjectId, ref: 'CHW', required: true},
    patientId: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true},
    visitDate: {type: Date, required: true},
    antinentalVisitDate: {type: Date, required: true},
    contact: {type: String, required: true}
},
{timestamps: true});

export default mongoose.model('CHWVisit', chwVisitSchema);