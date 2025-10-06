import bcrypt from 'bcryptjs';
import CHW from '../models/Chw.js';
import {generateToken} from '../utils/jwt.js'
import Patient from '../models/patient.js';


const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};



const signUpCHW = async (req, res) => {
    try{
        const {email, password} = req.body;
        if (!email || !password ) return res.status(400).json({message: "Input you name, email or password"});

        const existingUser = await CHW.findOne({email});
        if (existingUser) return res.status(400).json({message: "This user already exist"});

        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log(hashedPassword);

        const chwUser = await CHW.create({email, password: hashedPassword});

        res.status(201).json({
            message: "User successfully registered",
            success: true,
            data: chwUser
        });
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const loginCHW = async (req, res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password ) return res.status(400).json({message: "email and password are required"})
 
        const user = await CHW.findOne({email});

        const passwordMatches = bcrypt.compareSync(password, user.password);

        if (!user || !passwordMatches) return res.status(404).json({message: "Invalid email or password"});

        const accessToken = generateToken({userId: user._id});
        console.log(accessToken)

        res.cookie("token", accessToken, COOKIE_OPTIONS)

        res.status(200).json({message: "logged in successfully",
            success: true,
            token: accessToken
    });


    }catch(err){
        res.status(500).json({error: err.message})
    }
}

const chwProfile = async (req, res) => {
    try{
        const {fullName, state, localGovernment, facilityName, facilityCode} = req.body;

        const chwId = req.user._id;


        const updatedCHW = await CHW.findByIdAndUpdate(chwId, {fullName, state, localGovernment, facilityName, facilityCode}, {new: treu}).select("-password");

        res.status(201).json({message: "Profile updated", success: true, data: updatedCHW});

    }catch(err){
        res.status(500).json({error: err.message})
    }
} 

export const assignPatient = async (req, res) => {
  try {
    const {patientId } = req.body;

    const chwId = req.user._id

    const chw = await CHW.findById(chwId);
    const patient = await Patient.findById(patientId);

    if (!chw || !patient)
      return res.status(404).json({ error: "CHW or Patient not found" });

    chw.assignedPatients.push(patientId);
    patient.chw = chwId;

    await chw.save();
    await patient.save();

    res.status(200).json({ message: "Patient assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





export {signUpCHW, loginCHW, chwProfile};