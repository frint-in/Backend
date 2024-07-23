import express from "express";
import {
  deleteUser,
  find,
  finduserbytoken,
  getUserWithPendingStatus,
  getUserWithApprovedStatus,
  getUserWithCompletedStatus,
  updateUser,
  Seminar,
  getseminaruser,
  verifyUserEmail,
  verifyUserOtp,
} from "../controllers/Users.js";
import { verifyToken } from "../verifyToken.js";
import fast2sms from "fast-two-sms";
import axios from 'axios'
import { createCalendarEvent } from "../controllers/Users.js";

const router = express.Router();

//update
router.put("/updateuser", verifyToken, updateUser);
router.put("/seminar", verifyToken, Seminar);
router.get("/getseminaruser", getseminaruser);

//delete
router.delete("/:id", verifyToken, deleteUser);

//get
router.get("/find/:id", find);

router.get("/finduserbytoken", verifyToken, finduserbytoken);

router.get(
  "/getUserWithPendingStatusForInternship",
  verifyToken,
  getUserWithPendingStatus
);
router.get(
  "/getUserWithApprovedStatusForInternship",
  verifyToken,
  getUserWithApprovedStatus
);
router.get(
  "/getUserWithCompletedStatusForInternship",
  verifyToken,
  getUserWithCompletedStatus
);

//download
// router.get("/download/:id",verifyDownloadToken, getDownloadUrl)

//courses
// router.get("/courses/:id", verifyToken, )

//verifyEmail
router.post("/verifyemail", verifyUserEmail);

//verifyOTP
router.post("/verifyotp", verifyUserOtp);

//create-meeting-calender
router.post('/create-meeting', createCalendarEvent )

// router.post("/test", async (req, res) => {
//   try {
//     const { phno } = req.body;

//     console.log("phno>>>", phno);

//     console.log(
//       "process.env.FAST2SMS_API_KEY>>>>>",
//       process.env.FAST2SMS_API_KEY
//     );

//     // const otpresponse = await fast2sms.sendMessage( {authorization : process.env.FAST2SMS_API_KEY, message : 'This is your OTP 2344345' ,  numbers : [phno]})

//     // Define the message and phone number
//     const message = "Hello from Node.js!";
//     const phoneNumber = phno; // Replace with the recipient's phone number
//     // Create the SMS data
//     const smsData = {
//       sender_id: "FSTSMS",
//       message: message,
//       language: "english",
//       route: "q",
//       numbers: phoneNumber,
//     };
//     // Send the SMS
//    const otpresponse = await axios.post("https://www.fast2sms.com/dev/bulkV2", smsData, {
//       headers: {
//         Authorization: process.env.FAST2SMS_API_KEY,
//       },
//     });

//     if (otpresponse) {
//       res.status(200).json({ message: "sucessufelly sent otp to your number" });
//     }
//   } catch (err) {
//     console.log("error in test>>>", err);
//     res.status(400).json({ message: `something is wrong>>>>>>>> ${err}` });
//   }
// });

export default router;
