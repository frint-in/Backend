import Users from "../models/Users.js";
import Internship from "../models/Internship.js";
import dotenv from 'dotenv'
import multer from "multer";






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




export const addInternship = async (req, res) => {
    try {
        upload.single('image')(req, res, async function (err) {

            if (err instanceof multer.MulterError) {
                
                console.error(err);
                return res.status(500).json({ message: 'Failed to upload image' });
            } else if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            

            cloudinary.uploader.upload(req.file.path, {
                public_id: req.body.name
            }, async function (error, result) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
                }

                console.log(result);

                const newInternship = new Internship({ userID: req.user.id, imgurl: result.url, ...req.body });

                const savedInternship = await newInternship.save();
                res.status(200).json(savedInternship);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}




export const deleteInternship = async()=>{
    try{
        const Internship = await Internship.findById(req.params.id)
        if(!Internship){
            console.log('Internship not found')
        }
        if(req.user.id === Internship.userID){
            const deletedInternship = await Internship.findByIdAndDelete(req.params.id)
            res.status(200).json(deletedInternship)
        }
    }catch(err){
        console.log(err)
    }
}



export const updateInternship = async(req, res)=>{
      
    try{
        const internship = await Internship.findById(req.params.id)
        if(!internship){
            console.log('Internship not found')
        }
        if(req.user.id === Internship.userID){
            const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {
                $set:req.body,
            }, {
                new:true
            })
            res.status(200).json(updatedInternship)
        }
    }catch(err){
        console.log(err)
    }
}


export const findInternship = async(req, res)=>{
    try{
        const internship = await Internship.findById(req.params.id)
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}

export const findmyInternship = async(req, res)=>{
    try{
        const internship = await Internship.findById({userID: req.user.id})
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}



export const getAllIntership = async(req, res)=>{
    try{
        const internship = await Internship.find()
        res.status(200).json(internship)
    }catch(err){
        console.log(err)
    }
}


export const applicants = async(req, res)=>{
      
    try{
        const internship = await Internship.findById(req.params.id)
        const user = await Users.findById(req.user.id)
        if(!internship){
            console.log('Internship not found')
        }
        
            const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {
                $set:{subuser: req.user.id},
            }, {
                new:true
            })
            res.status(200).json(updatedInternship)

            const updatedUser = await Users.findByIdAndUpdate(req.user.id , {
                $set:{applications: req.params.id},
            }, {
                new:true
            })
            res.status(200).json(updatedInternship)

        
    }catch(err){
        console.log(err)
    }
}





