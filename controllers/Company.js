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


import { google} from 'googleapis'
import { SpacesServiceClient } from '@google-apps/meet';
import { Storage } from '@google-cloud/storage';


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
  // process.env.DOMAIN_COMPANY
)

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
});

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

//cloud storage connect
const storageGoogle = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    type: process.env.GCP_TYPE,
    project_id: process.env.GCP_PROJECT_ID,
    private_key_id: process.env.GCP_PRIVATE_KEY_ID,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GCP_CLIENT_EMAIL,
    client_id: process.env.GCP_CLIENT_ID,
    universe_domain: process.env.GCP_UNIVERSE_DOMAIN,
  },
});

//bucket initialization
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storageGoogle.bucket(bucketName);


          
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret 
});



// const {SpacesServiceClient} = require('@google-apps/meet').v2;







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
                public_id: req.body.name,
                timeout: 120000
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
        }).status(200).json({message: 'Logged in successfully',others})
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
      return res.status(401).json({ message: "company not found" });

    }
        try {
            upload.single('image')(req, res, async function (err) {
    
                if (err instanceof multer.MulterError) {
                    console.error(err);
                    return res.status(409).json({ message: 'Failed to add image' });
                } else if (err) {
                    console.error(err);
                    return res.status(409).json({ message: 'internal server error' });
                }

                console.log("req body in form upload>>>>>>", req.body);
                console.log("req files in form upload>>>>>>", req.file);

                const updates = {};
                const profileImg = req.file;

                // Iterate over fields from req.body and add to updates if not empty
                for (const key in req.body) {
                    if (req.body[key] !== "") {
                    updates[key] = req.body[key];
                    }
                }


    
                if (profileImg){
                    const previousImg = company.imgurl;

                    if (previousImg) {
                        const oldFileName = previousImg.split("/").pop();
                        console.log("oldFilename>>>>>>>>", oldFileName);
                        const oldFile = bucket.file(oldFileName);
                        await oldFile.delete();
                        console.log("old file deleted successfully", previousImg);
                      }

                      const newFileName = Date.now() + "-" + profileImg.originalname;
                      const blob = bucket.file(newFileName);
                      const blobStream = blob.createWriteStream({
                        metadata: {
                          contentType: profileImg.mimetype,
                        },
                        public: true,
                      });
              
                      blobStream.on("error", (err) => {
                        console.error("Blob stream error", err);
                        return res.status(500).json({message :`Error uploading file. Please try again`});
                      });
              
                      blobStream.on("finish", async () => {
                        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
                        updates.imgurl = publicUrl;
                      });
              
                      blobStream.end(profileImg.buffer);
                    } else {
                      console.log("No profile image uploaded");
                    }


                          //-----------------------------update database----------------------------------
        const updateDatabase = async () => {
            try {
              const updatedCompany = await Company.findByIdAndUpdate(
                req.company.id,
                { $set: updates },
                { new: true, runValidators: true }
              ).lean();
    
              delete updatedCompany.password;
              delete updatedCompany.refreshToken;
  
              console.log('updatedCompany',updatedCompany );
  
              res.status(200).json({message: 'Profile Edited Successfully', company: updatedCompany });
            } catch (updateErr) {
              console.error("Database update error", updateErr);
              res.status(500).json({ message: "server timed out. Please try later" });
            }
          };
    
          // Ensure all streams finish before updating the database
          const interval = setInterval(() => {
            if (
              (!profileImg || updates.imgurl)
            ) {
              clearInterval(interval);
              updateDatabase();
            }
          }, 100);

          //////////////////////////////////////////////////////////

//cloudinary
    //             cloudinary.uploader.upload(req.file.path, {
    //                 public_id: req.body.name
    //             }, async function (error, result) {
    //                 if (error) {
    //                     console.error(error);
    //                     return res.status(409).json({ error: 'Image not uploaded to cloudinary' });
    //                 }
    
    //                 console.log(result);

    //         const  updatedCompany = await Company.findByIdAndUpdate(req.company.id , {
    //             $set: { ...req.body, imgurl: result.secure_url },
    //         }, {
    //             new:true
    //         })
    //         res.status(200).json({message: 'Profile updated sucessfully', updatedCompany})
        
    // })
    
    })
    }catch(err){
        console.log(err)
        res.status(err.statusCode || 500).json({ message: err.message });    }

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
export const getCompany = async(req, res) =>{

    try{
        const company = await Company.findById(req.company.id).populate('internships')
        res.status(200).json(company)
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




export const getUsersWithapprovedByCompany = async (req, res) => {
    try {
      const internships = await Internship.find({ company: req.company.id });
      const internshipIds = internships.map(internship => internship._id);
  
      const users = await Users.find({
        "applications.internship": { $in: internshipIds },
        "applications.status": "approved"
      });
  
      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const getUsersWithpendingByCompany = async (req, res) => {
    try {
      const internships = await Internship.find({ company: req.company.id });
      const internshipIds = internships.map(internship => internship._id);
  
      const users = await Users.find({
        "applications.internship": { $in: internshipIds },
        "applications.status": "pending"
      });
  
      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  export const getUsersWithcompletedByCompany = async (req, res) => {
    try {
      const internships = await Internship.find({ company: req.company.id });
      const internshipIds = internships.map(internship => internship._id);
  
      const users = await Users.find({
        "applications.internship": { $in: internshipIds },
        "applications.status": "completed"
      });
  
      res.status(200).json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  };



  export const createCalendarEvent = async (req, res) => {
    try {
  
      // console.log('req.body', req.body);
      const { summary, description, startDateTime, endDateTime, location, userId } = req.body;
  
      const companyId = req.company.id

      console.log('companyId',companyId );


      console.log('userId',userId );
  
      if (!userId || !companyId) {
       return  res.status(400).json({message: 'userId or companyId not sent from the client'})
      }
  
  
  
      const user = await Users.findById(userId)

      console.log('user>>>>>', user);
  
      const company = await Company.findById(companyId)

      console.log('company>>>>>>>>', company);
      
  
      console.log('user>>>>>>>', user);
      console.log('company>>>>>>>', company);
  
      if (!user) {
       return  res.status(400).json({message: 'user not found'})
      }
  
      if (!company) {
        return  res.status(400).json({message: 'company not found'})
       }
      // Check if refresh token exists
      if (!user.refreshToken) {
        return res.status(400).json({ message: 'Refresh token not found. Login using google' });
      }
  
      if (!company.refreshToken) {
        return res.status(400).json({ message: 'Refresh token not found. Login using google' });
      }

        // Function to set credentials and get access token
    const getAccessToken = async (refreshToken) => {
      try {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { token } = await oauth2Client.getAccessToken();
        return token;
      } catch (err) {
        console.error('Invalid or expired refresh token', tokenError);
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

    };

    const userAccessToken = await getAccessToken(user.refreshToken);
    const companyAccessToken = await getAccessToken(company.refreshToken);

  
  
      // oauth2Client.setCredentials({ access_token: userAccessToken});
//first start with company acc, they create the meeting
    oauth2Client.setCredentials({ access_token: companyAccessToken });

  
  
      // Use the Calendar API
      const calendar = google.calendar('v3');
      
 

      // Instantiate the Meet client
const meetClient = new SpacesServiceClient({
  authClient: oauth2Client
});



// Function to create a meeting space
async function createMeetingSpace() {
  try {
    const request = {};
    const response = await meetClient.createSpace(request);
    return response;
  } catch (error) {
    console.log('error in creatingMeetingSpace>>>', error);
  }
 
}
 // Create a meeting space
 const meetingSpace = await createMeetingSpace();

 console.log('the created meetingSpace>>>>>>>>>>>>',meetingSpace );

 const conferenceData = {
  entryPoints: [
    {
      entryPointType: 'video',
      uri: meetingSpace[0].meetingUri,
      label: meetingSpace[0].meetingCode,
    },
  ],
  conferenceSolution: {
    key: {
      type: 'hangoutsMeet',
    },
  },
  conferenceId: meetingSpace[0].meetingCode,
};

//  console.log('meeting name?>>>>>>>', meetingSpace[0].name);




 const companyEvent = calendar.events.insert({
   auth: oauth2Client,
   calendarId: 'primary',
   requestBody: {
     summary,
     description,
     location,
     colorId: '7',
     start: { dateTime: new Date(startDateTime) },
     end: { dateTime: new Date(endDateTime) },
     conferenceData
   },
   conferenceDataVersion: 1,
 });
    //       // Add the same event to user's calendar with the same meeting link
    // oauth2Client.setCredentials({ access_token: companyAccessToken });
    oauth2Client.setCredentials({ access_token: userAccessToken});

      
    const userEvent = calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        location,
        colorId: '7',
        start: { dateTime: new Date(startDateTime) },
        end: { dateTime: new Date(endDateTime) },
        conferenceData
      },
      conferenceDataVersion: 1,
    });




  
      // res.status(201).json({ message: 'Event created successfully', userResponse, companyResponse });
      res.status(201).json({ message: 'Meet created successfully',  });
    } catch (err) {
      console.error('Error in OAuth', err);
      res.status(500).json({ message: 'Error while creating an event' });
    }
  };



  
  





