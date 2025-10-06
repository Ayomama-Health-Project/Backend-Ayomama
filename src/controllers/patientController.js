import Patient from '../models/patient.js';
import CHWvisit from '../models/chwVisit.js';

const logVisit = async (req, res) => {
    try{
        const {patientId, pregnancyStage, visitDate, medicationList, riskStatus, medicalHistory, patientInformation} = req.body;

        const visit = await CHWvisit.create({
            patientId,
            pregnancyStage,
            visitDate,
            medicationList,
            riskStatus,
            medicalHistory,
            patientInformation
        })
        const patient = await Patient.findByIdAndUpdate(patientId, {$push: {visits: visit._id}});

        res.status(201).json({message: "Visit logged successfully", success: true, data: visit}); 

    }catch(err){
        res.status(500).json({error: err.message})
    }
}

export {logVisit};