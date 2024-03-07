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
    }
});





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

    applications: [InternshipApplicationSchema],


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