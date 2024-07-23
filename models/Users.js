import mongoose from 'mongoose'
import validator from 'validator'

const InternshipApplicationSchema = new mongoose.Schema({
    internship: {
        type: mongoose.Types.ObjectId,
        ref: "Internship"
    },
    status: {
        type: String,
        default: "pending"
    },
   
})

 




const UserSchema = new mongoose.Schema({
    uname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate:[validator.isEmail]
    },
    password: {
        type: String,
        // required: true
    },
    avatar: {
        type: String,
    },

    applications: [InternshipApplicationSchema],


    role:{
        type:String,
        default: "student"
    },
    gender: {
        type:String,
        
    }, 
   phno: {
        type:String,
        
    },
    description: {
        type:String,
        
    },
    specialisation: {
        type:String,
        
    },
    education: {
        type:String,
        
    },
    dob: {
        type:String,
        
    },
    languages: {
        type:String,
        
    },
    skills: {
        type:String,
        
    },
    resume: {
        type:String,
        
    },
    seminar: {
        type: String,
        default: "false"
    },
    isGoogleUser: {
        type: Boolean,
        default: false
      },


    resetpassToken:{
        type:String,
    },
    resetpassExipre:{
        type:Date
    },
    verifyToken:{
        type:String
    },
    verifyTokenExpiry:{
        type:Date
    }, 
    isVerfied: {
        type: Boolean,
        default: false,
    },
    verifyOtp:{
        type:String
    },
    verifyOtpExpiry:{
        type:Date
    }, 
    refreshToken: {
        type: String
    }


},
{
    timestamps: true
}
)


export default mongoose.model("User", UserSchema)