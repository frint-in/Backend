import mongoose from 'mongoose'
import Users from '../models/Users.js'
import multer from 'multer';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import dotenv from 'dotenv'
import {v2 as cloudinary} from 'cloudinary';


dotenv.config()

const storage = multer.diskStorage({
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });


          
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret 
});


export const updateUser = (async(req, res)=>{

    console.log(req.user.id)
    const user = await Users.findById(req.user.id)
    if(!user){
        console.log('Company not found')
    }
        try {
            upload.single('image')(req, res, async function (err) {
    
                if (err instanceof multer.MulterError) {
                    console.error(err);
                    return res.status(409).json({ error: 'Failed to add image' });
                } else if (err) {
                    console.error(err);
                    return res.status(409).json({ error: 'internal server error' });
                }
    
                if (req.file && req.file.path){
                    const publicId = `${req.user.id}_${Date.now()}`;
                cloudinary.uploader.upload(req.file.path, {
                    public_id:publicId,
                }, async function (error, result) {
                    if (error) {
                        console.error(error);
                        return res.status(409).json({ error: 'Image not uploaded to cloudinary' });
                    }
    
                    console.log(result);

            const  updateduser = await Users.findByIdAndUpdate(req.user.id , {
                $set: { ...req.body, avatar: result.secure_url },
            }, {
                new:true
            })
            res.status(200).json(updateduser)
        
    });}
    else{
        // console.log('failed to upload image')
        const  updateduser = await Users.findByIdAndUpdate(req.user.id , {
            $set: req.body,
        }, {
            new:true
        })
        res.status(200).json(updateduser)
    }
})
    }catch(err){
        console.log(err)
        res.status(err.statusCode || 500).json({ error: err.message });    
    }

    }
)



export const deleteUser = async(req, res) =>{
    if(req.params.id === req.user.id){
        try{
            const deletedUser = await Users.findByIdAndDelete(req.params.id, )
            res.status(200).json("user deleted")
        }catch(err){
            console.log("err")
        }
    
    }else {
        console.log("tokenid != userid")
    }
}


export const find = async(req, res) =>{
        try{
            const user= await Users.findById(req.params.id)
            res.status(200).json(user)
        }catch(err){
            console.log("error in finding user")
        }
    }

    export const finduserbytoken = async(req, res) =>{
        try{
            const user= await Users.findById(req.user.id).populate('applications.internship')
            res.status(200).json(user)
        }catch(err){
            console.log("error in finding user")
        }
    } 


    export const getUserWithPendingStatus = async (req, res) => {
        try {
            const pendingInternships = [];

            // console.log('req user???>>>>', req.user);

            const user = await Users.findById(req.user.id)
    
            // Check if req.user is defined
            // if (!user) {
            //     return res.status(400).json({ message: 'User not found' });
            // }
    
            // // const user = req.user;
    
            // // Check if user.applications is an array
            // if (!Array.isArray(user.applications)) {
            //     return res.status(400).json({ message: 'Invalid user data' });
            // }
    
            user.applications.forEach(application => {
                if (application.status === 'pending') {
                    pendingInternships.push({
                        userId: user._id,
                        internshipId: application.internship,
                        name: application.name,
                        position: application.position,
                        type: application.type,
                        status: application.status
                    });
                }
            });
    
            res.status(200).json(pendingInternships);
    
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    };


    export const getUserWithApprovedStatus = async (req, res) => {
        try {
            const approvedInternships = [];

            console.log('req user???>>>>', req.user);

            const user = await Users.findById(req.user.id)
    
            // Check if req.user is defined
            // if (!user) {
            //     return res.status(400).json({ message: 'User not found' });
            // }
    
            // // const user = req.user;
    
            // // Check if user.applications is an array
            // if (!Array.isArray(user.applications)) {
            //     return res.status(400).json({ message: 'Invalid user data' });
            // }
    
            user.applications.forEach(application => {
                if (application.status === 'approved') {
                    approvedInternships.push({
                        userId: user._id,
                        internshipId: application.internship,
                        name: application.name,
                        position: application.position,
                        type: application.type,
                        status: application.status
                    });
                }
            });
    
            res.status(200).json(approvedInternships);
    
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    };



    export const getUserWithCompletedStatus = async (req, res) => {
        try {
            const completedInternships = [];

            console.log('req user???>>>>', req.user);

            const user = await Users.findById(req.user.id)
    
            // Check if req.user is defined
            // if (!user) {
            //     return res.status(400).json({ message: 'User not found' });
            // }
    
            // // const user = req.user;
    
            // // Check if user.applications is an array
            // if (!Array.isArray(user.applications)) {
            //     return res.status(400).json({ message: 'Invalid user data' });
            // }
    
            user.applications.forEach(application => {
                if (application.status === 'completed') {
                    completedInternships.push({
                        userId: user._id,
                        internshipId: application.internship,
                        name: application.name,
                        position: application.position,
                        type: application.type,
                        status: application.status
                    });
                }
            });
    
            res.status(200).json(completedInternships);
    
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    

    export const Seminar = async(req, res) => {
    try{
        const updatedUser = await Users.findByIdAndUpdate(req.user.id, {
            $set: { seminar: 'true' },
        }, {
            new: true
        });

        res.status(200).json(updatedUser);
    }
        catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }

    export const getseminaruser = async (req, res) => {
        try {
            const users = await Users.find({ seminar: true });
            res.status(200).json(users);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };


    export const verifyUserEmail = async (req,res) => {
        try {
            console.log('req body>>>>>>>>>', req.body);
            const {token} = req.body

            console.log('token>>>>>', token);
            
            const user = await Users.findOne({verifyToken: token, verifyTokenExpiry: {$gt:Date.now()}});
            
            if (!user) {
                res.status(400).json({ message: 'Invalid Token' });
            }

            console.log('user>>>>', user);

            user.isVerfied = true;
            user.verifyToken = undefined;
            user.verifyTokenExpiry = undefined;
            await user.save();

            res.status(200).json({
                message: "Email verified successfully",
                success: true
            });
            


        } catch (err) {
            console.log('error in verifyUserEmail>>>>', err);
            console.error('error in verifyUserEmail>>>>', err);
            res.status(500).json({ message: 'Server error' });
        }
    }