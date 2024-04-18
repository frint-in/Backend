import Users from "../models/Users.js";
import Internship from "../models/Internship.js";
import dotenv from 'dotenv'
import multer from "multer";






import {v2 as cloudinary} from 'cloudinary';
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Company from "../models/Company.js";

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




export const addInternship = AsyncHandler(async (req, res) => {
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
            cloudinary.uploader.upload(req.file.path, {
                public_id: req.body.name
            }, async function (error, result) {
                if (error) {
                    console.error(error);
                    return res.status(409).json({ error: 'Image not uploaded to cloudinary' });
                }

                console.log(result);

                const newInternship = new Internship({ imgurl: result.url, ...req.body, company: req.company.id });
             
                const savedInternship = await newInternship.save();
                res.status(200).json(savedInternship);

                const company = await Company.findByIdAndUpdate(
                    req.company.id,
                    { $push: { interships: newInternship._id } },
                    { new: true }
                );
                
                if (!company) {
                    throw new Error('Company not found');
                }

        
            });}
            else{
                return res.status(409).json({ error: 'Image path not found' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode).send(err.message);
    }
}
)




export const deleteInternship = AsyncHandler(async()=>{
    try{
        
        const Internship = await Internship.findById(req.params.id)
        if(!Internship){
            
            throw new ApiError(409, 'internship not found')
        }
        if(req.user.id === Internship.userID){
            const deletedInternship = await Internship.findByIdAndDelete(req.params.id)
            res.status(200).json(deletedInternship)
        }
    }catch(err){
        res.status(err.statusCode).send(err.message);
    }
})



export const updateInternship = AsyncHandler (async(req, res)=>{
      
    try{
        
        const internship = await Internship.findById(req.params.id)
        if(!internship){
            throw new ApiError(409, 'internship not found')
        }

        // if(req.user.id === Internship.userID){
            // get current data for this intenshipid from db
            // check current form data for null in req.body
            // replace null values from req.body from current data

            const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {
                $set:req.body,
            }, {
                new:true
            })
            res.status(200).json(updatedInternship)
        // }
    }catch(err){
        res.status(err.statusCode).send(err.message);
    }
})


export const findInternship = async(req, res)=>{
    try{
        const internship = await Internship.findById(req.params.id).populate('company')
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}

export const findmyInternship = async(req, res)=>{
    try{
        const internship = await Internship.findById({userID: req.user.id}).populate('company')
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}



export const getAllIntership = async(req, res)=>{
    try{
        const internship = await Internship.find().populate('company')
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}


// export const applicants = async(req, res)=>{
      
//     try{
//         const internship = await Internship.findById(req.params.id)
//         const user = await Users.findById(req.user.id)
//         if(!internship){
//             console.log('Internship not found')
//         }
        
//             const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {
//                 $set:{subuser: req.user.id},
//             }, {
//                 new:true
//             })
//             // res.status(200).json(updatedInternship)

//              const createdApplicationAt = new Date() 

//             const updatedUser = await Users.findByIdAndUpdate(req.user.id , {
//                 $push: { applications: { internship: req.params.id, status: 'pending', name: internship.name , position: internship.position, type: internship.type, createdApplicationAt: createdApplicationAt} },
//             }, {
//                 new:true
//             })
//             res.status(200).json(updatedUser)

        
//     }catch(err){
//         console.log(err)
//     }
// }

export const applicants = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        const user = await Users.findById(req.user.id);

        if (!internship || !user) {
            return res.status(404).json({ message: 'Internship or User not found' });
        }

        const updatedInternship = await Internship.findByIdAndUpdate(req.params.id, {
            $set: { subuser: req.user.id },
        }, {
            new: true
        });

        // const createdApplicationAt = new Date();

        const application = {
            internship: req.params.id,
            status: 'pending',
            name: internship.name,
            position: internship.position,
            type: internship.type,
            createdApplicantAt: new Date() // Include createdApplicationAt within the object
        };

        const updatedUser = await Users.findByIdAndUpdate(req.user.id, {
            $push: { applications: application },
        }, {
            new: true
        });

        res.status(200).json(updatedUser);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};






export const updatestudenttoapproved = async(req, res)=>{
      
    try {
        const internship = await Internship.findById(req.params.id);


        const user = await Users.findById(req.body.id); 
        
        if (!internship || !user) {
            return res.status(404).json({ message: 'Internship or user not found' });
        }

        // Update the user's application status to "approved" for the specified internship
        user.applications.forEach(app => {
            if (app.internship.toString() === req.params.id) {
                app.status = 'approved';
            }
        });

        // Save the updated user
        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}



export const updatestudenttocompleted = async(req, res)=>{
      
    try {
        const internship = await Internship.findById(req.params.id);
        const user = await Users.findById(req.body.id); // Assuming req.body.id is the user ID as a string
        
        if (!user) {
            return res.status(404).json({ message: 'Internship or user not found' });
        }

        // Update the user's application status to "approved" for the specified internship
        user.applications.forEach(app => {
            if (app.internship.toString() === req.params.id) {
                app.status = 'completed';
            }
        });

        // Save the updated user
        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}


export const getUsersWithPendingStatusForInternship = async (req, res) => {
    try {

        // const user = req.user

        const users = await Users.find({
            'applications.internship': req.params.id,
            'applications.status': 'pending'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getUsersWithapprovedStatusForInternship = async (req, res) => {
    try {
        const users = await Users.find({
            'applications.internship': req.params.id,
            'applications.status': 'approved'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsersWithcompletedStatusForInternship = async (req, res) => {
    try {
        const users = await Users.find({
            'applications.internship': req.params.id,
            'applications.status': 'completed'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsersWithapproved = async (req, res) => {
    try {
        const users = await Users.find({
            'applications.status': 'approved'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getUsersWithpending = async (req, res) => {
    try {
        const users = await Users.find({
            'applications.status': 'pending'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


export const getUsersWithcompleted = async (req, res) => {
    try {
        const users = await Users.find({
            'applications.status': 'completed'
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};



export const getUsersWithInternship = async (req, res) => {
    try {

        // const user = req.user

        const users = await Users.find({
            'applications.internship': req.params.id
           
        });

        res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

