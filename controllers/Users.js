import mongoose from "mongoose";
import Users from "../models/Users.js";
import multer from "multer";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { BlobServiceClient } from '@azure/storage-blob';

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

// azure initialization
const blobServiiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

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

// export const updateUser = async (req, res) => {
//     const user = await Users.findById(req.user.id);
//     if (!user) {
//       console.log("user not found");
//       return res.status(401).json({ message: "user not found" });
//     }
//     try {
//       upload.fields([
//         { name: "profileImg", maxCount: 1 },
//         { name: "resume", maxCount: 1 },
//       ])(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//           console.error(err);
//           return res.status(409).json({ message: "Failed to add image" });
//         } else if (err) {
//           console.error(err);
//           return res.status(409).json({ message: "internal server error" });
//         }
  
//         console.log("req body in form upload>>>>>>", req.body);
//         console.log("req files in form upload>>>>>>", req.files);
  
//         const profileImg = req.files["profileImg"];
//         const resume = req.files["resume"];
//         const updates = {};

//           // Iterate over fields from req.body and add to updates if not empty
//       for (const key in req.body) {
//         if (req.body[key] !== "") {
//           updates[key] = req.body[key];
//         }
//       }

//          // Parse applications field if it exists
//          if (updates.applications) {
//           try {
//             updates.applications = JSON.parse(updates.applications);
//           } catch (e) {
//             console.error("Error parsing applications field", e);
//             return res.status(400).json({ message: "Invalid applications format" });
//           }
//         }


  
//         //-------------------------------avatar-----------------------------
//         if (profileImg) {
//           const previousAvatar = user.avatar;
//           if (previousAvatar) {
//             const oldFileName = previousAvatar.split("/").pop();
//             console.log("oldFilename>>>>>>>>", oldFileName);
//             const oldFile = bucket.file(oldFileName);
//             const [exists] = await oldFile.exists();
//             if (exists) {
//               await oldFile.delete();
//               console.log("Old file deleted successfully", previousAvatar);
//             } else {
//               console.log("Avatar not found in GCS bucket:", previousAvatar);
//             }
//           }
  
//           const newFileName = Date.now() + "-" + profileImg[0].originalname;
//           const blob = bucket.file(newFileName);
//           const blobStream = blob.createWriteStream({
//             metadata: {
//               contentType: profileImg[0].mimetype,
//             },
//             public: true,
//           });
  
//           blobStream.on("error", (err) => {
//             console.error("Blob stream error", err);
//             return res.status(500).json({message :`Error uploading file. Please try again`});
//           });
  
//           blobStream.on("finish", async () => {
//             const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
//             updates.avatar = publicUrl;
//             console.log('finished uploading>>>>>>>', publicUrl);
//             console.log('updates object after photo upload>>>>>>', updates);
//           });
  
//           blobStream.end(profileImg[0].buffer);
//         } else {
//           console.log("No profile image uploaded");
//         }
  
//         //-------------------------------resume-----------------------------
//         if (resume) {
//           const previousResume = user.resume;
//           if (previousResume) {
//             const oldFileName = previousResume.split("/").pop();
//             console.log("oldResumeFilename>>>>>>>>", oldFileName);
//             const oldFile = bucket.file(oldFileName);
//             const [exists] = await oldFile.exists();
//             if (exists) {
//               await oldFile.delete();
//               console.log("Old resume deleted successfully", previousResume);
//             } else {
//               console.log("Resume not found in GCS bucket:", previousResume);
//             }
//           }
  
//           const newResumeFileName = Date.now() + "-" + resume[0].originalname;
//           const resumeBlob = bucket.file(newResumeFileName);
//           const resumeBlobStream = resumeBlob.createWriteStream({
//             metadata: {
//               contentType: resume[0].mimetype,
//             },
//             public: true,
//           });
  
//           resumeBlobStream.on("error", (err) => {
//             console.error("Resume blob stream error", err);
//             return res.status(500).json({message :`Error uploading file. Please try again`});
//           });
  
//           resumeBlobStream.on("finish", async () => {
//             const resumePublicUrl = `https://storage.googleapis.com/${bucket.name}/${newResumeFileName}`;
//             updates.resume = resumePublicUrl;


//           });
  
//           resumeBlobStream.end(resume[0].buffer);
//         } else {
//           console.log("No resume uploaded");
//         }
  
//         //-----------------------------update database----------------------------------
//         const updateDatabase = async () => {
//           try {
//             console.log('final update object before updating in the db>>>>>>>', updates); 
//             const updatedUser = await Users.findByIdAndUpdate(
//               req.user.id,
//               { $set: updates },
//               { new: true, runValidators: true }
//             ).lean();
  
//             delete updatedUser.password;
//             delete updatedUser.refreshToken;

//             console.log('updatedUser');

//             res.status(200).json({message: 'Profile Edited Successfully', user: updatedUser });
//           } catch (updateErr) {
//             console.error("Database update error", updateErr);
//             res.status(500).json({ message: "server timed out. Please try later" });
//           }
//         };
  
//         // Ensure all streams finish before updating the database
//         const interval = setInterval(() => {
//           if (
//             (!profileImg || updates.avatar) &&
//             (!resume || updates.resume)
//           ) {
//             clearInterval(interval);
//             updateDatabase();
//           }
//         }, 100);
  
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(err.statusCode || 500).json({ error: err.message });
//     }
//   };
  
export const userBasicDetails = async (req, res) => {
  try {
    // Find the user by ID
    const user = await Users.findById(req.user.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const { phno, ...otherFields } = req.body;

    // Update any other fields provided in the request
    Object.assign(user, otherFields);

    // Save the updated user data
    await user.save();

    console.log("User updated successfully");
    return res.status(200).json({ message: "User updated successfully", user });

  } catch (error) {
    console.error("Error updating user details", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUser = async (req, res) => {
  const user = await Users.findById(req.user.id);
  if (!user) {
    console.log("user not found");
    return res.status(401).json({ message: "user not found" });
  }

  try {
    await new Promise((resolve, reject) => {
      upload.fields([
        { name: "profileImg", maxCount: 1 },
        { name: "resume", maxCount: 1 },
      ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return reject({ status: 409, message: "Failed to add image" });
        } else if (err) {
          console.error(err);
          return reject({ status: 409, message: "internal server error" });
        }
        resolve();
      });
    });

    console.log("req body in form upload>>>>>>", req.body);
    console.log("req files in form upload>>>>>>", req.files);

    const profileImg = req.files["profileImg"];
    const resume = req.files["resume"];
    const updates = {};

    // Iterate over fields from req.body and add to updates if not empty
    for (const key in req.body) {
      if (req.body[key] !== "" && key !== "finalStep") {
        if (key === "specialisation" || key === "languages" || key === "education" ||      key === "skills" ||
          key === "achievements" ||
          key === "experience") {
          updates[key] = JSON.parse(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    }


    // Function to handle file upload and return a Promise
    const uploadFile = async (file, type) => {
      if (file) {
        const previousFile = type === 'profileImg' ? user.avatar : user.resume;
        if (previousFile) {
          const oldFileName = previousFile.split("/").pop();
          console.log("oldFileName>>>>>>>>", oldFileName);
          const oldBlob = containerClient.getBlockBlobClient(oldFileName);

            
          try {
            await oldBlob.getProperties(); // Check if the blob exists
            await oldBlob.delete();
            console.log("Old file deleted successfully", previousFile);
          } catch (error) {
            if (error.statusCode === 404) {
              console.log(`${type} not found in Azure blob container:`, previousFile);
            } else {
              console.error(`Error checking existence of ${type}:`, error);
              throw error;
            }
          }
        }

        const newFileName = Date.now() + "-" + file[0].originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
        return new Promise(async (resolve, reject) => {
          try {
            await blockBlobClient.uploadData(file[0].buffer, {
              blobHTTPHeaders: { blobContentType: file[0].mimetype },
            });
            const publicUrl = `${blockBlobClient.url}`;
            updates[type === 'profileImg' ? 'avatar' : 'resume'] = publicUrl;
            console.log(`finished uploading ${type}>>>>>>>`, publicUrl);
            resolve();
          } catch (err) {
            console.error(`${type} upload error`, err);
            reject(err);
          }
        });
      } else {
        console.log(`No ${type} uploaded`);
      }
    };

    // Upload files and wait for completion
    await Promise.all([
      uploadFile(profileImg, 'profileImg'),
      uploadFile(resume, 'resume')
    ]);

    // Update database
    try {
      console.log('final update object before updating in the db>>>>>>>', updates);
      const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      delete updatedUser.password;
      delete updatedUser.refreshToken;

      console.log('updatedUser');
      res.status(200).json({ message: 'Profile Edited Successfully', user: updatedUser });
    } catch (updateErr) {
      console.error("Database update error", updateErr);
      res.status(500).json({ message: "server timed out. Please try later" });
    }
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({ error: err.message });
  }
};


export const onboardUser = async (req, res) => {


  const user = await Users.findById(req.user.id);
  if (!user) {
    console.log("user not found");
    return res.status(401).json({ message: "user not found" });
  }

  try {
    await new Promise((resolve, reject) => {
      upload.fields([
        { name: "profileImg", maxCount: 1 },
        { name: "resume", maxCount: 1 },
      ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return reject({ status: 409, message: "Failed to add image" });
        } else if (err) {
          console.error(err);
          return reject({ status: 409, message: "internal server error" });
        }
        resolve();
      });
    });

    console.log("req body in form upload>>>>>>", req.body);
    console.log("req files in form upload>>>>>>", req.files);

    const profileImg = req.files["profileImg"];
    const resume = req.files["resume"];
    const updates = {};

    // Iterate over fields from req.body and add to updates if not empty
    for (const key in req.body) {
      if (req.body[key] !== "" && key !== "finalStep") {
        if (key === "specialisation" || key === "languages" || key === "education" ||      key === "skills" ||
          key === "achievements" ||
          key === "experience") {
          updates[key] = JSON.parse(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    // res.status(200).json({ message: 'Profile Edited Successfully', user: updates });
    
    // Check if it's the final step
    const isFinalStep = req.body.finalStep === 'true';
    
    if (isFinalStep) {
      // Add isOnboarded property to updates objectf
      updates.isOnboarded = true;
    }

    console.log("updates>>>>>>>>>", updates);

    // res.status(200).json({ 
    //   message: isFinalStep ? 'Onboarding Completed Successfully' : 'Profile Updated Successfully', 
    //   user: updates 
    // });




    // Function to handle file upload and return a Promise
    const uploadFile = async (file, type) => {
      if (file) {
        const previousFile = type === 'profileImg' ? user.avatar : user.resume;
        if (previousFile) {
          const oldFileName = previousFile.split("/").pop();
          console.log("oldFileName>>>>>>>>", oldFileName);
          const oldBlob = containerClient.getBlockBlobClient(oldFileName);
          try {
            await oldBlob.getProperties(); // Check if the blob exists
            await oldBlob.delete();
            console.log("Old file deleted successfully", previousFile);
          } catch (error) {
            if (error.statusCode === 404) {
              console.log(`${type} not found in Azure blob container:`, previousFile);
            } else {
              console.error(`Error checking existence of ${type}:`, error);
              throw error;
            }
          }
        }

        const newFileName = Date.now() + "-" + file[0].originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(newFileName);

        return new Promise(async (resolve, reject) => {
          try {
            await blockBlobClient.uploadData(file[0].buffer, {
              blobHTTPHeaders: { blobContentType: file[0].mimetype },
            });
            const publicUrl = `${blockBlobClient.url}`;
            updates[type === 'profileImg' ? 'avatar' : 'resume'] = publicUrl;
            console.log(`finished uploading ${type}>>>>>>>`, publicUrl);
            resolve();
          } catch (err) {
            console.error(`${type} upload error`, err);
            reject(err);
          }
        });
      } else {
        console.log(`No ${type} uploaded`);
      }
    };

    // Upload files and wait for completion
    await Promise.all([
      uploadFile(profileImg, 'profileImg'),
      uploadFile(resume, 'resume')
    ]);

    // Update database
    try {
      console.log('final update object before updating in the db>>>>>>>', updates);
      const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      delete updatedUser.password;
      delete updatedUser.refreshToken;



      console.log('updated user>>>>>>>>',updatedUser );

      console.log('updatedUser');
      // res.status(200).json({ message: 'Profile Edited Successfully', user: updatedUser });
          res.status(200).json({ 
      message: isFinalStep ? 'Onboarding Completed Successfully. Welcome to F rint!' : 'Profile Updated Successfully', 
      user: updatedUser 
    });
    } catch (updateErr) {
      console.error("Database update error", updateErr);
      res.status(500).json({ message: "server timed out. Please try later" });
    }
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).json({ error: err.message });
  }
}


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
    user.isGoogleUser = true;
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

export const updateEducationAndSkills = async (req, res) => {
  try {
    // Find the user first
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle file upload using multer
    await new Promise((resolve, reject) => {
      upload.fields([
        { name: "resume", maxCount: 1 },
      ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.error(err);
          return reject({ status: 409, message: "Failed to add file" });
        } else if (err) {
          console.error(err);
          return reject({ status: 409, message: "internal server error" });
        }
        resolve();
      });
    });

    const { college, department, yearOfPassing, address, skills, preferences } = req.body;
    const resume = req.files?.["resume"];
    
    // Only include fields that are provided in the request
    const updates = {};
    
    if (college) updates['education.graduation.college'] = college;
    if (department) updates['education.graduation.department'] = department;
    if (yearOfPassing) updates['education.graduation.yearOfPassing'] = yearOfPassing;
    if (address) updates.address = address;
    if (skills) updates.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    if (preferences) updates.preferences = Array.isArray(preferences) ? preferences : JSON.parse(preferences);

    // Handle resume upload if provided
    if (resume) {
      const uploadFile = async (file) => {
        const previousFile = user.resume;
        if (previousFile) {
          const oldFileName = previousFile.split("/").pop();
          console.log("oldFileName>>>>>>>>", oldFileName);
          const oldBlob = containerClient.getBlockBlobClient(oldFileName);
          try {
            await oldBlob.getProperties();
            await oldBlob.delete();
            console.log("Old file deleted successfully", previousFile);
          } catch (error) {
            if (error.statusCode === 404) {
              console.log("Resume not found in Azure blob container:", previousFile);
            } else {
              console.error("Error checking existence of resume:", error);
              throw error;
            }
          }
        }

        const newFileName = Date.now() + "-" + file[0].originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(newFileName);

        await blockBlobClient.uploadData(file[0].buffer, {
          blobHTTPHeaders: { blobContentType: file[0].mimetype },
        });
        const publicUrl = `${blockBlobClient.url}`;
        updates.resume = publicUrl;
        console.log("finished uploading resume>>>>>>>", publicUrl);
      };

      await uploadFile(resume);
    }

    // Only update if there are fields to update
    if (Object.keys(updates).length > 0) {
      const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      delete updatedUser.password;
      delete updatedUser.refreshToken;

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};