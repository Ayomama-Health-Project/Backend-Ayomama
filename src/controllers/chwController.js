import bcrypt from 'bcryptjs';
import CHW from '../models/Chw.js';
import {generateToken} from '../utils/jwt.js'


const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};



const signUpCHW = async (req, res) => {
    try{
        const { name, email, password} = req.body;
        if (!name || !email || !password ) return res.status(400).json({message: "Input you name, email or password"});

        const existingUser = await CHW.findOne({email});
        if (existingUser) return res.status(400).json({message: "This user already exist"});

        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log(hashedPassword);

        const chwUser = await CHW.create({name, email, password: hashedPassword});

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

// const chwProfile = async (req, res) => {
//     try{
//         const {name, state, localGovernment, facilityName, facilityCode} = req.body

//         const chwId = req.user._id

//         const user = await CHW.findByIdAndUpdate({id: chwId})

//     }catch(err){
//         res.status(500).json({error: err.message})
//     }
// } 




export {signUpCHW, loginCHW}