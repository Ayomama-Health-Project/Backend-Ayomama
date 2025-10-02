import express from 'express';
import connectDB from './utils/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'
import visitRoutes from './routes/visitRoutes.js'
import userRoutes from './routes/userRoutes.js'

dotenv.config()

const app = express();
const port = 3000;

app.use(express.json()) 

connectDB();

app.use("/api/auth", authRoutes)
app.use("/api/visit", visitRoutes)
app.use("/api/user", userRoutes)


app.get("/", (req, res) =>{
    res.send({"message": "This is ayomama backend"})
});

app.listen(port, (req, res) => {
    console.log(`server running on {http://localhost:3000}`)
});