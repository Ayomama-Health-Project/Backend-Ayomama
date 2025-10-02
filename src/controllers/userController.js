import User from '../models/user.js'


const updateLanguagePreference = async (req, res) => {
    try{
        const userId = req.user.userId;
        const { preferredLanguages } = req.body;

        const newLanguagePreference = await User.findByIdAndUpdate(userId, {preferredLanguages} ,{new: true}).select('-password');

        res.status(201).json({message: newLanguagePreference});

    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const profileInformation = async (req, res) => {
    try{
        const userId = req.user.userId;
        const {name, address, lastPeriodDate, emergencyContact} = req.body;

        const updatedProfile = await User.findByIdAndUpdate(userId, {name, address, lastPeriodDate, emergencyContact}, {new: true}).select('-password');

        res.status(201).json({message: updatedProfile});

    }catch(err){
        res.status(500).json({error: err.message})
    }
}



export {updateLanguagePreference, profileInformation}