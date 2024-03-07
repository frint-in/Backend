import mongoose from 'mongoose'


const InternshipSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: false
    },
    catagories: {
        type: [String],
        required: false
    },
    location: {
        type: String,
        required: true
    },
    phono:{
        type: Number,
        required:true
    },
    imgurl: {
        type: String,
        required: false
    },
    subuser:[{
        type:mongoose.Types.ObjectId,
        ref: "User"
    }],
    deadline: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    stipend: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },

},{timestamps: true})


export default mongoose.model("Internship", InternshipSchema)