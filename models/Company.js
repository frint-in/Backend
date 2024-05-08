import mongoose from 'mongoose'


const CompanySchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        unique: true
        },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String ,
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
        required: true
    },
    internships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship"
    }],
    // subuser:[{
    //     type:mongoose.Types.ObjectId,
    //     ref: "User"
    // }]
    

},{timestamps: true})


export default mongoose.model("Company", CompanySchema)