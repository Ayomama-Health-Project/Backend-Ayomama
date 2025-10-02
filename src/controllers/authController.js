import User from "../models/user.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js"


const signUp = async (req, res) => {
    try{

        const {email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', userId: user._id });

    }
    catch (err) {
        console.error('signUp error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        if (!user.password || typeof user.password !== 'string') {
            console.error('loginUser error: stored password is missing or invalid for user', user._id);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const passwordMatches = bcrypt.compareSync(password, user.password);
        if (!passwordMatches) return res.status(401).json({ error: 'Invalid email or password' });

        const accessToken = generateToken({ userId: user._id });

        res.status(200).json({ message: 'Login successful', token: accessToken });
    }
    catch(err){
        console.error('loginUser error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        // Support tokens that contain userId or id
        const id = req.user.userId || req.user.id || req.user._id;

        const user = await User.findById(id).select('-password');
        console.log(user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    }catch (err){
        res.status(500).json({error: err.message});
    };
};


export {signUp, loginUser, getProfile};
