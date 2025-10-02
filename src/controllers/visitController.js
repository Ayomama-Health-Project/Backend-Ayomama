import Visit from '../models/Visit.js'


const visitSchedule = async (req, res) => {
    try{
        const { visitDate, visitTime, duration, hospitalName, doctorName } = req.body;

        const userId = req.user.userId;

        if (!visitDate || !visitTime){
            res.status(400).json({error: "Visit Date and Time are required"});
        }

        const visit = await Visit.create({
            user: userId,
            visitDate,
            visitTime,
            duration,
            hospitalName,
            doctorName
        });
        res.status(200).json({message: "Visit Successfully Scheduled", visit})

    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const getVisits = async (req, res) => {
    try{
        const userId = req.user.userId;
        const visits = await Visit.find({user: userId});
        res.status(200).json({visits});
    }catch(err){
        res.status(500).json({err: err.message})
    }
}


export {visitSchedule, getVisits}