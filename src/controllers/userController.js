import {User, PostPartum} from "../models/user.js";
// import {dateConverter} from "../utils/dateConverter.js";

const getUser = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // Support tokens that contain userId or id
    const id = req.user._id;

    const user = await User.findById(id).select("-password");
    // console.log(user);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User found", success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateLanguagePreference = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferredLanguages } = req.body;

    const newLanguagePreference = await User.findByIdAndUpdate(
      userId,
      { preferredLanguages },
      { new: true }
    ).select("-password");

    res.status(201).json({
      message: "Language preference updated",
      success: true,
      data: newLanguagePreference,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const profileInformation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, address, lastPeriodDate, contact, emergencyContact } =
      req.body;

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { name, address, lastPeriodDate, contact, emergencyContact },
      { new: true }
    ).select("-password");

    res.status(201).json({
      message: "Profile updated",
      success: true,
      data: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUserEmergencyContact = async (req, res) => {
  try{
    const userId = req.user._id;
    const user = await User.findById(userId).select("emergencyContact -_id");
    if (!user) return res.status(404).json({error: "User not found"});

  res.status(200).json({message: "Emergency contact for user", success: true, data: user.emergencyContact})

  }catch(err){
    res.status(500).json({success: false, error: err.message})
  }
}

// ========================= POST PARTUM ONBOARDING AND DASHBOARD ===========================

const getPostPartumUser = async (req, res) => {
  try{
    const postPartumId = req.user._id;
    console.log({postPartumId: postPartumId})

    const postPartumUser = await PostPartum.findById(postPartumId).select('-password');

    if (!postPartumUser) return res.status(404).json({message: "PostPartum User not found", success:false, error: err.message});
    
    res.status(200).json({message: "Post Partum User Found", success: true, data: postPartumUser});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

const postPartumProfileInfo = async(req, res) => {
  try{
    const postPartumId = req.user._id;
    const {name, address, emergencyContact} = req.body;
    const profileInfo = await PostPartum.findByIdAndUpdate(postPartumId, 
      {name, address, emergencyContact},
      {new: true}).select('-password');

    res.status(201).json({message: "Post Partum User Updated Successfully", success: true, data: profileInfo});
  }catch(err){
    res.status(500).json({success: false, error: err.message});
  }
}

const babyAge = async(req, res) => {
  try{
    const postPartumId = req.user._id;
    const {babyAge} = req.body;

    const updateBabyAge = await PostPartum.findByIdAndUpdate(postPartumId, {babyAge}, {new:true}).select('-password');

    res.status(201).json({message: "Babies Age Updated Successfully", success: true, data: updateBabyAge});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message })
  }
};

const babyBirthInfo = async(req, res) => {
  try{
    const postPartumId = req.user._id;
    const {babyBirthHospital, babyImmunization, healthConcerns, babyWeight} = req.body;

    const updatedBabyInfo = await PostPartum.findByIdAndUpdate(postPartumId, {babyBirthHospital, babyImmunization, healthConcerns, babyWeight}).select("-password");
    res.status(201).json({message: "baby Info Updated Successfully", success: true,  data: updatedBabyInfo});  
  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
};

const babyNickname = async(req, res) => {
  try{
    const postPartumId = req.user._id;
    const {babyNickname} = req.body;

    const updatedNickname = await PostPartum.findByIdAndUpdate(postPartumId, {babyNickname}).select("-password");
    res.status(201).json({message: "Baby Nickname Updated Successfully", success: true, data: updatedNickname});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
};

// ======= POST PARTUM HOME ========

const babyTracker = async(req, res) => {
  try{
    const postPartumId = req.user._id;
    const {babyWeight, babyHeight, lastFeedingTime, nextFeedingTime, lastDiaperChangeTime, nextDiaperChangeTime} = req.body;

    const updatedBabyTracker = await Baby.findOneAndUpdate(
      {userId: postPartumId},
      {
        $push: {
          babyTracker: {
            babyWeight,
            babyHeight,
            babyFeedingRemainder: [
              {
                lastFeedingTime,
                nextFeedingTime
              }
            ],
            babyDiaperChangeRemainder: [
              {
                lastDiaperChangeTime,
                nextDiaperChangeTime
              }
            ]
          }
        }
      },
      {new: true}
    );

    res.status(201).json({message: "Baby Tracker Updated Successfully", success: true, data: updatedBabyTracker});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message});
  }
}


const motherVitalTracker = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {temperature, bloodPressure, weight, bloodLevel} = req.body;

    const updatedMotherVital = await motherVital.findOneAndUpdate(
      {userId: partumId},
      {
        temperature,
        bloodPressure,
        weight,
        bloodLevel
      },
      {new: true}
    );

    res.status(201).json({message: "Mother Vital Tracker Updated Successfully", success: true, data: updatedMotherVital});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

// ========= MOTHER ==========

const motherMoodTracker = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {motherMood, symptoms} = req.body;
    const updatedMotherMood = await motherVital.findOneAndUpdate(
      {userId: partumId},
      {
        motherMood,
        symptoms
      },
      {new: true}
    );

    res.status(201).json({message: "Mother Mood Tracker Updated Successfully", success: true, data: updatedMotherMood});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

const mealTracker = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {mealType, mealDescription, mealWeight} = req.body;

    const updatedMealTracker = await motherVital.findOneAndUpdate(
      {userId: partumId},
      {
        $push: {
          meal: {
            mealType,
            mealDescription,
            mealWeight
          }
        }
      },
      {new: true}
    );

    res.status(201).json({message: "Meal Tracker Updated Successfully", success: true, data: updatedMealTracker});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

// =========== BABY ===========

const updateBabyGrowth = async(req, res) => {
  try{
    const partumId = req.user._id;

    const {babyWeight, babyHeight, babyAge} = req.body;

    const updatedBabyGrowth = await Baby.findOneAndUpdate(
      {userId: partumId},
      {
        babyWeight,
        babyHeight,
        babyAge
      },
      {new: true}
    );

    res.status(201).json({message: "Baby Growth Updated Successfully", success: true, data: updatedBabyGrowth});
    
  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

const changeBabyDiaper = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {lastDiaperChangeTime, nextDiaperChangeTime} = req.body;

    const updatedBabyDiaper = await Baby.findOneAndUpdate(
      {userId: partumId},
      {
        $push: {
          babyDiaperChangeRemainder: {
            lastDiaperChangeTime,
            nextDiaperChangeTime
          }
        }
      },
      {new: true}
    );

    res.status(201).json({message: "Baby Diaper Changed Successfully", success: true, data: updatedBabyDiaper});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

const changeBabyFeeding = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {lastFeedingTime, nextFeedingTime} = req.body;

    const updatedBabyFeeding = await Baby.findOneAndUpdate(
      {userId: partumId},
     {
        $push: {
          babyFeedingRemainder: {
            lastFeedingTime,
            nextFeedingTime
          }
        }
     },
      {new: true}
    );

    res.status(201).json({message: "Baby Feeding Updated Successfully", success: true, data: updatedBabyFeeding});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
}

const babySleepTracker = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {lastSleepTime, nextSleepTime} = req.body;

    const updatedBabySleep = await Baby.findOneAndUpdate(
      {userId: partumId},
      {
        $push: {
          babySleepRemainder: {
            lastSleepTime,
            nextSleepTime
          }
        }
      },
      {new: true}
    );

    res.status(201).json({message: "Baby Sleep Tracker Updated Successfully", success: true, data: updatedBabySleep});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
};

const babyImmunizationTracker = async(req, res) => {
  try{
    const partumId = req.user._id;
    const {immunizationName, immunizationDate, immunizationDueDateInWeeks, immunizationStatus} = req.body;

    const updatedBabyImmunization = await Baby.findOneAndUpdate(
      {userId: partumId},
      {
        $push: {
          babyImmunization: {
            immunizationName,
            immunizationDate,
            immunizationDueDateInWeeks,
            immunizationStatus  
          }
        }
      },
      {new: true}
    )

    res.status(201).json({message: "Baby Immunization Tracker Updated Successfully", success: true, data: updatedBabyImmunization});

  }catch(err){
    res.status(500).json({message: "Internal Server Error", success: false, error: err.message})
  }
};


export {
  updateLanguagePreference,
  profileInformation,
  getUser,
  getUserEmergencyContact,
  getPostPartumUser,
  postPartumProfileInfo,
  babyAge,
  babyBirthInfo,
  babyNickname,
  updateBabyGrowth,
  changeBabyDiaper,
  changeBabyFeeding,
  babySleepTracker,
  babyImmunizationTracker
};

