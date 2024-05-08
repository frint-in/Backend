import mongoose from 'mongoose'


const InternshipSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    company: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    companyName: {
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
        type: String,
        required: false
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
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    deadline: {
        type: String,
        required: true
    },
    duration:{
        type: String,
    },
    type: {
        type: String,
        required: true,
        default: "internship"
    },
    position: {
        type: String,
        required: true,
        default: "developer"
    },
    mode: {
        type: String,
        required: true,
        default: "remote"
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