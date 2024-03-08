import mongoose from 'mongoose'
import Users from '../models/Users.js'



export const update = async(req, res) =>{
if(req.params.id === req.user.id){
    try{
        const updatedUser = await Users.findByIdAndUpdate(req.params.id, {
            $set:req.body
        },
        {
            new:true
        })
        res.status(200).json("user updated")
    }catch(err){
        console.log("err")
    }

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
                        type: application.type
                    });
                }
            });
    
            res.status(200).json(pendingInternships);
    
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server error' });
        }
    };
    