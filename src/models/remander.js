import mongoose from 'mongoose'

const remainderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    visit: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
         ref: "Visit"
    },
    remainderTime: {
        required: true,
        type: Date
    },
    message: {
        type: String
    },
    status: {
        type: String 
    },
},
{timestamp:true}
)