import { decodeToken } from '../utils/jwt.js'
import dotenv from 'dotenv'
import {User, PostPartum} from '../models/user.js'
import CHW from '../models/Chw.js'
import { requestPasswordReset } from '../controllers/authController.js'

dotenv.config()

const authMiddleware = (req, res, next) => {
    // Get the auth header from the request user is sending
    const authHeader = req.headers["authorization"];

    let token;
    if (authHeader){
        token = authHeader.split(" ")[1];
        
    };

    if (!token){
        return res.status(401).json({error: "No token Provided"});
    }

    try {
        const decodedUser  = decodeToken(token);
        req.user = decodedUser;
        return next();
    }
    catch(err){
        res.status(500).json({error: err.message});
    };
};

export async function protectRoute(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: You must be logged in to access this route',
        success: false,
      });
    }

    let decoded;
    try {
      decoded = decodeToken(token);
      console.log("Decoded token:", decoded);
    } catch (err) {
      return res.status(401).json({ message: 'Token expired or invalid', success: false });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    const postPartumUser = await PostPartum.findById(decoded.userId).select('-password');
    
    if (!user && !postPartumUser) {
      return res.status(401).json({ message: 'User not found', success: false });
    }
    
    if (user) {
      req.user = user;
    } else {
      req.user = postPartumUser;
    }
    // req.user = user;
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', success: false, error: err.message});
  }
}


export async function protectCHW(req, res, next) {
  try {
    console.log(req)
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: You must be logged in to access this route",
        success: false,
      });
    }

    let decoded;
    try {
      decoded = decodeToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Token invalid or expired", success: false });
    }

    const chw = await CHW.findById(decoded.userId).select("-password");
    if (!chw) {
      return res.status(401).json({ message: "CHW not found", success: false });
    }

    req.user = chw;
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
}



export { authMiddleware }