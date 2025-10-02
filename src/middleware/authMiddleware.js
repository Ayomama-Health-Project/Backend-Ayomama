import { decodeToken } from '../utils/jwt.js'
import dotenv from 'dotenv'

dotenv.config()

const authMiddleware = (req, res, next) => {
    // Get the auth header from the request user is sending
    const authHeader = req.headers["authorization"];

    let token;
    if (authHeader){
        token = authHeader.split(" ")[1];
        // console.log(token);
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

export { authMiddleware }