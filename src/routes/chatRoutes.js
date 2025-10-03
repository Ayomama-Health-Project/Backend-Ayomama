import express from 'express'
import {chatWithBot} from './controllers/chatController.js'
import authMiddleware from './middleware/authMiddleware.js'

router = express.Router()

router.post("/", authMiddleware, chatWithBot);

export default router

