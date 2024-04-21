import mongoose from 'mongoose'
import Users from '../models/Users.js'



export const update = async(req, res) =>{

if(req.params.id){
    if(req.body.avatar.url === null || req.body.resume === null ){
    try{
        const cunntUser = await Users.findById(req.params.id)
        const avatar_url= req.body.avatar.url?req.body.avatar.url:cunntUser.avatar.url
        const resume_url= req.body.resume?req.body.resume:cunntUser.resume

        const sexybody = {
            ...req.body,
            avatar:{
                url:avatar_url,
            },
            resume:resume_url
        }
        const updatedUser = await Users.findByIdAndUpdate(req.params.id, {
            $set:sexybody
        },
        {
            new:true
        })
        res.status(200).json(updatedUser)

    }
    catch(err){
        res.status(err.statusCode).send(err.message);

    }
    }
    else{
    try{
        const updatedUser = await Users.findByIdAndUpdate(req.params.id, {
            $set:req.body
        },
        {
            new:true
        })
        res.status(200).json(updatedUser)
    }catch(err){
        res.status(err.statusCode).send(err.message);
    }}

}else {
    console.log("tokenid != userid")
}
}


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
            const user= await Users.findById(req.user.id)
            res.status(200).json(user)
        }catch(err){
            console.log("error in finding user")
        }
    } 


    export const getUserWithPendingStatus = async (req, res) => {
        try {
            const pendingInternships = [];

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
    