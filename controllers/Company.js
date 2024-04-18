import mongoose from 'mongoose'
import Company from '../models/Company.js'
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";
import { resolveContent } from "nodemailer/lib/shared/index.js";
import sendEmail from "../sendEmail.js";
import crypto from "crypto"
import Internship from "../models/Internship.js";
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import dotenv from 'dotenv'
import multer from "multer";
import {v2 as cloudinary} from 'cloudinary';
import Users from '../models/Users.js';



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







export const signupCompany = AsyncHandler(async(req, res) =>{

    try{
        
        upload.single('image')(req, res, async function (err) {
            const existingcompany = await Company.findOne({ name: req.body.name });

        if (existingcompany) {
            return res.status(409).json({ error: 'Company name already exists' });
        }
        const existingCompanyByEmail = await Company.findOne({ email: req.body.email });
        if (existingCompanyByEmail) {
            return res.status(409).json({ error: 'Email address already exists' });
        }

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

                
        const password = req.body.password.toString()
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newCompany = new Company({...req.body, password: hash, imgurl: result.secure_url})



        await newCompany.save()
        res.status(200).json({ message: "User created" });

    });}else{
        return res.status(409).json({ error: 'Image path not found' });
    }
});
    } catch (err) {
        console.log(err);
        res.status(err.statusCode || 500).json({ error: err.message });  
    }
}

)

//signin

export const signinCompany = AsyncHandler(async(req, res) =>{
    try{
        const company = await Company.findOne({email:req.body.email})
        if(!company){
            throw new ApiError(409, 'incorrect email')
        }
        
        const isCorrect = await bcrypt.compare(req.body.password.toString(), company.password);
        if(!isCorrect){
            throw new ApiError(409, 'incorrect password')
        }
        


        else{
        const {password, ...others} = company._doc
        const token = jwt.sign({id:company._id}, process.env.JWT)
        res.cookie("access_token_company", token, {
            httpOnly:true
        }).status(200).json({others, token})
        }
    }catch (err) {
        console.log(err)
        res.status(err.statusCode || 500).json({ error: err.message });    }
}
)







export const updateCompany = AsyncHandler(async(req, res)=>{

    console.log(req.company.id)
    const company = await Company.findById(req.company.id)
    if(!company){
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
                cloudinary.uploader.upload(req.file.path, {
                    public_id: req.body.name
                }, async function (error, result) {
                    if (error) {
                        console.error(error);
                        return res.status(409).json({ error: 'Image not uploaded to cloudinary' });
                    }
    
                    console.log(result);

            const  updatedCompany = await Company.findByIdAndUpdate(req.company.id , {
                $set: { ...req.body, imgurl: result.secure_url },
            }, {
                new:true
            })
            res.status(200).json(updatedCompany)
        
    });}
    else{
        const  updatedCompany = await Company.findByIdAndUpdate(req.company.id , {
            $set: req.body,
        }, {
            new:true
        })
        res.status(200).json(updatedCompany)
    }
})
    }catch(err){
        console.log(err)
        res.status(err.statusCode || 500).json({ error: err.message });    }

    }
)

export const deleteCompany = async(req, res) =>{

        try{
            const company = await Company.findByIdAndDelete(req.company.id, )
            res.status(200).json("user deleted")
        }catch(err){
            res.status(err.statusCode || 500).json({ error: err.message }); 
        }
    
    
}


export const findAllCompanies = async (req, res) => {
    try {
        const company = await Company.find();
        res.status(200).json(company);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const findCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        
        if(!company){
            throw new ApiError(409, 'company not found')

        }
        res.status(200).json(company);
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ error: err.message });
        }
};

export const findInternshipByCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate('internships');
        
        if(!company){
            throw new ApiError(409, 'company not found')

        }

        res.status(200).json(company.internships);
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ error: err.message });
        }
};





