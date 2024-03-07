import mongoose from 'mongoose'
import validator from 'validator'


const UserSchema = new mongoose.Schema({
    uname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate:[validator.isEmail]
    },
    password: {
        type: String,
        required: true
    },
    avatar: {

        url:{
            type:String,
            default:"dmvbjskbv"
        }
    },
    applications:[
            {type: mongoose.Types.ObjectId,
         ref: "Internship"}
    ],
    role:{
        type:String,
        default: "student"
    },
    resetpasswordtoken:{
        type:String,
    },
    resetpasswordexipre:{
        type:Date
    }


},{timestamps: true})


export default mongoose.model("User", UserSchema)