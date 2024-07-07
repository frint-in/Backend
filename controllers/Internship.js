import Users from "../models/Users.js";
import Internship from "../models/Internship.js";
import dotenv from "dotenv";
import multer from "multer";
import { Storage } from "@google-cloud/storage";

import { v2 as cloudinary } from "cloudinary";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Company from "../models/Company.js";

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

// export const addInternship = AsyncHandler(async (req, res) => {
//     try {
//         upload.single('image')(req, res, async function (err) {

//             //error handling
//             if (err instanceof multer.MulterError) {
//                 console.error(err);
//                 return res.status(409).json({ error: 'Failed to add image' });
//             } else if (err) {
//                 console.error(err);
//                 return res.status(409).json({ error: 'internal server error' });
//             }

//             //google storage
//             const file = req.file
//             if(!file){
//                 console.log('no file found');

//                 res.status(401).send('No file uploaded')
//             }

//             if (req.file && req.file.path){
//             cloudinary.uploader.upload(req.file.path, {
//                 public_id: req.body.name
//             }, async function (error, result) {
//                 if (error) {
//                     console.error(error);
//                     return res.status(409).json({ error: 'Image not uploaded to cloudinary' });
//                 }

//                 console.log(result);

//                 const newInternship = new Internship({ imgurl: result.url, ...req.body, company: req.company.id });

//                 const savedInternship = await newInternship.save();
//                 res.status(200).json(savedInternship);

//                 //new: true ensures that the updated document after the id push is returned
//                 const company = await Company.findByIdAndUpdate(
//                     req.company.id,
//                     { $push: { internships: savedInternship._id } },
//                     { new: true }
//                 );

//                 if (!company) {
//                     throw new Error('Company not found');
//                 }

//             });}
//             else{
//                 return res.status(409).json({ error: 'Image path not found' });
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(err.statusCode).send(err.message);
//     }
// }
// )

//google cloud storage implementation

export const addInternship = AsyncHandler(async (req, res) => {
  try {
    upload.single("image")(req, res, async function (err) {
      // Error handling
      if (err instanceof multer.MulterError) {
        console.log("error in multer>>>>>>>>>>>>>");
        console.error(err);
        return res.status(409).json({ error: "Failed to add image" });
      } else if (err) {
        console.log("multer internal server error>>>>>>>>");
        console.error(err);
        return res.status(409).json({ error: "Internal server error" });
      }

      console.log("req body in add internship>>>>", req.body);

      const file = req.file;
      if (!file) {
        console.log("No file found");
        return res.status(400).send("No file uploaded");
      }

      console.log("req file>>>>>>>>>.", req.file);

      // Google Cloud Storage
      const fileName = Date.now() + "-" + file.originalname;

      console.log("1");
      const blob = bucket.file(fileName);

      console.log("2");
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
        public: true,
      });

      console.log("3");

      blobStream.on("error", (err) => {
        console.log("4");
        console.error("Blob stream error", err);
        return res.status(500).send(`Error uploading file: ${err}`);
      });

      blobStream.on("finish", async () => {
        console.log("5");

        // Construct the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Create a new Internship with the image URL
        const newInternship = new Internship({
          imgurl: publicUrl,
          ...req.body,
          company: req.company.id,
        });
        const savedInternship = await newInternship.save();
        res.status(200).json(savedInternship);

        // Update the company with the new internship
        const company = await Company.findByIdAndUpdate(
          req.company.id,
          { $push: { internships: savedInternship._id } },
          { new: true }
        );

        if (!company) {
          throw new Error("Company not found");
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (err) {
    console.error(err);
    console.log("final error>>>>>>>>>>>>>>>>>");
    res.status(500).send(err.message);
  }
});

export const deleteInternship = AsyncHandler(async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      throw new ApiError(409, "internship not found");
    }
    // // if(req.user.id === internship.userID){
    // // }

    if (internship.imgurl) {
      try {
        const filename = internship.imgurl.split("/").pop();
        const file = bucket.file(filename);
        await file.delete();
        console.log("image deleted from gsc successfully");
      } catch (err) {
        console.log("unable to delete image", err);
      }
    }

    const deletedInternship = await Internship.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedInternship);
  } catch (err) {
    console.log("error", err);
    res.status(err.statusCode).json(err.message);
  }
});

// export const updateInternship = AsyncHandler (async(req, res)=>{

//     try{

//         const internship = await Internship.findById(req.params.id)
//         console.log("internship before update>>>>", internship);
//         if(!internship){
//             throw new ApiError(409, 'internship not found')
//         }

//         const internshipImgUrl = internship.imgurl

//         const oldFileName = internshipImgUrl.split('/').pop();
//         const newFile = req.file

//         console.log("req body>>>>>>>>>>>", req.body);
//         console.log("req file>>>>>>>>>>>", req.file);

//         console.log("oldFilename>>>>>>>>", oldFileName);
//       const newFileName = Date.now() + "-" + newFile?.originalname
//       if (newFile) {
//           // Delete the old file
//           const oldFile = bucket.file(oldFileName);

//           console.log("old file name from bucket selected>>>>", oldFile);
//           await oldFile.delete();

//           // Upload the new file with the new name
//       const blob = bucket.file(newFileName);
//       const blobStream = blob.createWriteStream({
//         metadata: {
//           contentType: newFile.mimetype
//         },
//         public: true
//       });

//       blobStream.on('error', (err) => {
//         res.status(500).send(`Error uploading file: ${err}`);
//       });

//       blobStream.on('finish', async () => {

//             // Construct the public URL
//             const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;

//         const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {...req.body, imgurl:publicUrl })
//         // res.status(200).json(updatedInternship)
//         res.status(200).json({message: "intership updated successfully", updatedInternship})

//       });

//       blobStream.end(newFile.buffer);

//       }else{

//                 const updatedInternship = await Internship.findByIdAndUpdate(req.params.id , {
//                   $set:req.body,
//               }, {
//                   new:true
//               })

//               console.log("updated internship>>>>>", updatedInternship);
//               res.status(200).json({message: "intership updated successfully", updatedInternship})
//       }
//     // res.status(200).json(updatedInternship)

//         // if(req.user.id === Internship.userID){
//             // get current data for this intenshipid from db
//             // check current form data for null in req.body
//             // replace null values from req.body from current data

//         // }
//     }catch(err){
//         res.status(err.statusCode).send(err.message);
//     }
// })

export const updateInternship = AsyncHandler(async (req, res) => {
  try {
    upload.single("image")(req, res, async function (err) {
      console.log("1");
      // Error handling
      if (err instanceof multer.MulterError) {
        console.log("2");

        console.error(err);
        return res.status(409).json({ error: "Failed to add image" });
      } else if (err) {
        console.log("3");

        console.error(err);
        return res.status(409).json({ error: "Internal server error" });
      }

      console.log("4");

      // Google Cloud Storage

      console.log("req body in edit internship>>>>", req.body);
      console.log("5 body");

      const internship = await Internship.findById(req.params.id);
      console.log("internship before update>>>>", internship);
      if (!internship) {
        throw new ApiError(409, "internship not found");
      }

      const internshipImgUrl = internship.imgurl;
      const oldFileName = internshipImgUrl.split("/").pop();
      const newFile = req.file;

      console.log("req body>>>>>>>>>>>", req.body);
      console.log("req file>>>>>>>>>>>", req.file);
      console.log("req imgurl>>>>>>>>>>>", req.imgurl);
      console.log("oldFilename>>>>>>>>", oldFileName);

      const newFileName = Date.now() + "-" + newFile?.originalname;

      console.log("5 1");

      if (newFile) {
        console.log("6 main 1");

        // Delete the old file
        const oldFile = bucket.file(oldFileName);

        // console.log("old file name from bucket selected>>>>", oldFile);
        await oldFile.delete();


        // Upload the new file with the new name
        const blob = bucket.file(newFileName);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: newFile.mimetype,
          },
          public: true,
        });

        console.log("6 main 4");

        blobStream.on("error", (err) => {
          res.status(500).send(`Error uploading file: ${err}`);
        });

        blobStream.on("finish", async () => {
          // Construct the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
          const updatedInternship = await Internship.findByIdAndUpdate(
            req.params.id,
            {
              ...req.body,
              imgurl: publicUrl,
            },
            {
              new: true,
            }
          );

          res
            .status(200)
            .json({
              message: "Internship updated successfully",
              updatedInternship,
            });
        });

        blobStream.end(newFile.buffer);
      } else {
        try {
          console.log("nigg1 ");

          const updatedInternship = await Internship.findByIdAndUpdate(
            req.params.id,
            {
              $set: req.body,
            },
            {
              new: true,
            }
          );

          console.log("updated internship>>>>>", updatedInternship);
          res
            .status(200)
            .json({
              message: "Internship updated successfully",
              updatedInternship,
            });
        } catch (err) {
          console.log("error while updating in else block");
          console.error("the error as follows>>>>>>>", err);
        }
      }
    });
  } catch (err) {
    res.status(err.statusCode || 500).send(err.message);
  }
});

export const findInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "company"
    );
    res.status(200).json(internship);
  } catch (err) {
    console.log(err);
  }
};

export const findmyInternship = async (req, res) => {
  try {
    const internship = await Internship.findById({
      userID: req.user.id,
    }).populate("company");
    res.status(200).json(internship);
  } catch (err) {
    console.log(err);
  }
};

export const getAllIntership = async (req, res) => {
  try {
    const internship = await Internship.find().populate("company");
    res.status(200).json(internship);
  } catch (err) {
    console.log(err);
  }
};

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
      return res.status(404).json({ message: "Internship or User not found" });
    }

    //Doubt: what is the use of updating subuser after every applicant that applies to an internship?
    const updatedInternship = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        $set: { subuser: req.user.id },
      },
      {
        new: true,
      }
    );

    // const createdApplicationAt = new Date();

    const application = {
      internship: req.params.id,
      status: "pending",
    };

    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      {
        $push: { applications: application },
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatestudenttoapproved = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    const user = await Users.findById(req.body.id); // Assuming req.body.id is the user ID as a string

    if (!user) {
      return res.status(404).json({ message: "Internship or user not found" });
    }

    // Update the user's application status to "approved" for the specified internship
    user.applications.forEach((app) => {
      if (app.internship.toString() === req.params.id) {
        app.status = "approved";
      }
    });

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatestudenttocompleted = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    const user = await Users.findById(req.body.id); // Assuming req.body.id is the user ID as a string

    if (!user) {
      return res.status(404).json({ message: "Internship or user not found" });
    }

    // Update the user's application status to "approved" for the specified internship
    user.applications.forEach((app) => {
      if (app.internship.toString() === req.params.id) {
        app.status = "completed";
      }
    });

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithPendingStatusForInternship = async (req, res) => {
  try {
    // const user = req.user

    const users = await Users.find({
      "applications.internship": req.params.id,
      "applications.status": "pending",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithapprovedStatusForInternship = async (req, res) => {
  try {
    const users = await Users.find({
      "applications.internship": req.params.id,
      "applications.status": "approved",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithcompletedStatusForInternship = async (req, res) => {
  try {
    const users = await Users.find({
      "applications.internship": req.params.id,
      "applications.status": "completed",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithapproved = async (req, res) => {
  try {
    const users = await Users.find({
      "applications.status": "approved",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithpending = async (req, res) => {
  try {
    const users = await Users.find({
      "applications.status": "pending",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithcompleted = async (req, res) => {
  try {
    const users = await Users.find({
      "applications.status": "completed",
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersWithInternship = async (req, res) => {
  try {
    // const user = req.user

    const users = await Users.find({
      "applications.internship": req.params.id,
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
