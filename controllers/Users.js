import mongoose from "mongoose";
import Users from "../models/Users.js";
import multer from "multer";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Storage } from "@google-cloud/storage";


import { google} from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
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
    // auth_uri: process.env.GCP_AUTH_URI,
    // token_uri: process.env.GCP_TOKEN_URI,
    // auth_provider_x509_cert_url: process.env.GCP_AUTH_PROVIDER_X509_CERT_URL,
    // client_x509_cert_url: process.env.GCP_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GCP_UNIVERSE_DOMAIN,
  },
});

//bucket initialization
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storageGoogle.bucket(bucketName);

// export const getDownloadUrl = async (req, res) => {
//   const filename = req.params.filename

//   const file = bucket.file(filename)

//   try {
//       const [exists] = await file.exists()
//       if(!exists){
//           res.status(404).send('file not found')
//           return
//       }

//       await file.makePublic();

//       // Construct the public URL
//       const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

//       res.status(200).json(publicUrl);
//     } catch (err) {
//       console.error('error in downloading file>>>>>>', err)
//       res.status(500).json({ message: "Server error" });
//   }
// };

export const updateUser = async (req, res) => {
    console.log(req.user.id);
    const user = await Users.findById(req.user.id);
    if (!user) {
      console.log("user not found");
      return res.status(401).json({ message: "user not found" });
    }
    try {
      upload.fields([
        { name: "profileImg", maxCount: 1 },
        { name: "resume", maxCount: 1 },
      ])(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return res.status(409).json({ message: "Failed to add image" });
        } else if (err) {
          console.error(err);
          return res.status(409).json({ message: "internal server error" });
        }
  
        console.log("req body in form upload>>>>>>", req.body);
        console.log("req files in form upload>>>>>>", req.files);
  
        const profileImg = req.files["profileImg"];
        const resume = req.files["resume"];
        const updates = {};

          // Iterate over fields from req.body and add to updates if not empty
      for (const key in req.body) {
        if (req.body[key] !== "") {
          updates[key] = req.body[key];
        }
      }


  
        //-------------------------------avatar-----------------------------
        if (profileImg) {
          const previousAvatar = user.avatar;
          if (previousAvatar) {
            const oldFileName = previousAvatar.split("/").pop();
            console.log("oldFilename>>>>>>>>", oldFileName);
            const oldFile = bucket.file(oldFileName);
            await oldFile.delete();
            console.log("old file deleted successfully", previousAvatar);
          }
  
          const newFileName = Date.now() + "-" + profileImg[0].originalname;
          const blob = bucket.file(newFileName);
          const blobStream = blob.createWriteStream({
            metadata: {
              contentType: profileImg[0].mimetype,
            },
            public: true,
          });
  
          blobStream.on("error", (err) => {
            console.error("Blob stream error", err);
            return res.status(500).json({message :`Error uploading file. Please try again`});
          });
  
          blobStream.on("finish", async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
            updates.avatar = publicUrl;
          });
  
          blobStream.end(profileImg[0].buffer);
        } else {
          console.log("No profile image uploaded");
        }
  
        //-------------------------------resume-----------------------------
        if (resume) {
          const previousResume = user.resume;
          if (previousResume) {
            const oldFileName = previousResume.split("/").pop();
            console.log("oldResumeFilename>>>>>>>>", oldFileName);
            const oldFile = bucket.file(oldFileName);
            await oldFile.delete();
            console.log("old resume deleted successfully", previousResume);
          }
  
          const newResumeFileName = Date.now() + "-" + resume[0].originalname;
          const resumeBlob = bucket.file(newResumeFileName);
          const resumeBlobStream = resumeBlob.createWriteStream({
            metadata: {
              contentType: resume[0].mimetype,
            },
            public: true,
          });
  
          resumeBlobStream.on("error", (err) => {
            console.error("Resume blob stream error", err);
            return res.status(500).json({message :`Error uploading file. Please try again`});
          });
  
          resumeBlobStream.on("finish", async () => {
            const resumePublicUrl = `https://storage.googleapis.com/${bucket.name}/${newResumeFileName}`;
            updates.resume = resumePublicUrl;
          });
  
          resumeBlobStream.end(resume[0].buffer);
        } else {
          console.log("No resume uploaded");
        }
  
        //-----------------------------update database----------------------------------
        const updateDatabase = async () => {
          try {
            const updatedUser = await Users.findByIdAndUpdate(
              req.user.id,
              { $set: updates },
              { new: true, runValidators: true }
            ).lean();
  
            delete updatedUser.password;
            delete updatedUser.refreshToken;

            res.status(200).json({message: 'Profile Edited Successfully', user: updatedUser });
          } catch (updateErr) {
            console.error("Database update error", updateErr);
            res.status(500).json({ message: "server timed out. Please try later" });
          }
        };
  
        // Ensure all streams finish before updating the database
        const interval = setInterval(() => {
          if (
            (!profileImg || updates.avatar) &&
            (!resume || updates.resume)
          ) {
            clearInterval(interval);
            updateDatabase();
          }
        }, 100);
  
      });
    } catch (err) {
      console.log(err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  };
  

export const deleteUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    try {
      const deletedUser = await Users.findByIdAndDelete(req.params.id);
      res.status(200).json("user deleted");
    } catch (err) {
      console.log("err");
    }
  } else {
    console.log("tokenid != userid");
  }
};

export const find = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    console.log("error in finding user");
  }
};

export const finduserbytoken = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).populate(
      "applications.internship"
    );
    res.status(200).json(user);
  } catch (err) {
    console.log("error in finding user");
  }
};

export const getUserWithPendingStatus = async (req, res) => {
  try {
    const pendingInternships = [];

    // console.log('req user???>>>>', req.user);

    const user = await Users.findById(req.user.id);

    // Check if req.user is defined
    // if (!user) {
    //     return res.status(400).json({ message: 'User not found' });
    // }

    // // const user = req.user;

    // // Check if user.applications is an array
    // if (!Array.isArray(user.applications)) {
    //     return res.status(400).json({ message: 'Invalid user data' });
    // }

    user.applications.forEach((application) => {
      if (application.status === "pending") {
        pendingInternships.push({
          userId: user._id,
          internshipId: application.internship,
          name: application.name,
          position: application.position,
          type: application.type,
          status: application.status,
        });
      }
    });

    res.status(200).json(pendingInternships);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserWithApprovedStatus = async (req, res) => {
  try {
    const approvedInternships = [];

    console.log("req user???>>>>", req.user);

    const user = await Users.findById(req.user.id);

    // Check if req.user is defined
    // if (!user) {
    //     return res.status(400).json({ message: 'User not found' });
    // }

    // // const user = req.user;

    // // Check if user.applications is an array
    // if (!Array.isArray(user.applications)) {
    //     return res.status(400).json({ message: 'Invalid user data' });
    // }

    user.applications.forEach((application) => {
      if (application.status === "approved") {
        approvedInternships.push({
          userId: user._id,
          internshipId: application.internship,
          name: application.name,
          position: application.position,
          type: application.type,
          status: application.status,
        });
      }
    });

    res.status(200).json(approvedInternships);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserWithCompletedStatus = async (req, res) => {
  try {
    const completedInternships = [];

    console.log("req user???>>>>", req.user);

    const user = await Users.findById(req.user.id);

    // Check if req.user is defined
    // if (!user) {
    //     return res.status(400).json({ message: 'User not found' });
    // }

    // // const user = req.user;

    // // Check if user.applications is an array
    // if (!Array.isArray(user.applications)) {
    //     return res.status(400).json({ message: 'Invalid user data' });
    // }

    user.applications.forEach((application) => {
      if (application.status === "completed") {
        completedInternships.push({
          userId: user._id,
          internshipId: application.internship,
          name: application.name,
          position: application.position,
          type: application.type,
          status: application.status,
        });
      }
    });

    res.status(200).json(completedInternships);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const Seminar = async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      {
        $set: { seminar: "true" },
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getseminaruser = async (req, res) => {
  try {
    const users = await Users.find({ seminar: true });
    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyUserEmail = async (req, res) => {
  try {
    console.log("req body>>>>>>>>>", req.body);
    const { token } = req.body;

    console.log("token>>>>>", token);

    const user = await Users.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid Token" });
    }

    console.log("user>>>>", user);

    user.isVerfied = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (err) {
    console.log("error in verifyUserEmail>>>>", err);
    console.error("error in verifyUserEmail>>>>", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const verifyUserOtp = async (req, res) => {
  try {
    console.log("req body>>>>>>>>>", req.body);
    const { otp } = req.body;

    console.log("token from user>>>>>", otp);

    const user = await Users.findOne({
      verifyOtp: otp,
    });

    if (!user) {
     return res.status(401).json({ message: "incorrect OTP. Try again" });
    }

    if (user.verifyOtpExpiry <= Date.now()) {
      return res.status(401).json({ message: "OTP has expired. Try again" });
    }

    console.log("user>>>>", user);

    user.isVerfied = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: "Account verification successfully",
      success: true,
    });
  } catch (err) {
    console.log("error in verifyUserOTP>>>>", err);
    console.error("error in verifyUserOTP>>>>", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const createCalendarEvent = async (req, res) => {
  try {

    // console.log('req.body', req.body);
    const { summary, description, startDateTime, endDateTime, location, id } = req.body;


    if (!id) {
     return  res.status(400).json({message: 'id not sent from the client'})
    }

    const user = await Users.findById(id)

    console.log('user>>>>>>>', user);

    if (!user) {
     return  res.status(400).json({message: 'user not found'})
    }
    // Check if refresh token exists
    if (!user.refreshToken) {
      return res.status(400).json({ message: 'Refresh token not found. Login using google' });
    }



    oauth2Client.setCredentials({ refresh_token: user.refreshToken });

    // Verify if the refresh token is valid
    try {
      const token = await oauth2Client.getAccessToken();

      console.log('token while checking if RT is valid>>', token);
    } catch (tokenError) {
      console.error('Invalid or expired refresh token', tokenError);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Use the Calendar API
    const calendar = google.calendar('v3');

    const response =  calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        location,
        colorId: '7',
        start: {
          dateTime: new Date(startDateTime),
        },
        end: {
          dateTime: new Date(endDateTime),
        },
      },
    });

    res.status(201).json({ message: 'Event created successfully', response });
  } catch (err) {
    console.error('Error in OAuth', err);
    res.status(500).json({ message: 'Error while creating an event' });
  }
};
