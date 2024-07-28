import mongoose from "mongoose";
import Users from "../models/Users.js";
import Company from '../models/Company.js'

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { resolveContent } from "nodemailer/lib/shared/index.js";
import dotenv from 'dotenv'

import {sendEmail} from '../helpers/mailer.js'

import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { generateRandomString } from "../utils/Oauth.js";
import { sendOtpTwilio } from "../helpers/sendSms.js";

import { google} from 'googleapis'
import handleGoogleAuth from "../helpers/googleAuth.js";


dotenv.config()

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
)

//student

export const signup = AsyncHandler(async (req, res) => {
  try {

    const {phno} = req.body

    const existingUser = await Users.findOne({phno})

    if (existingUser) {
      console.log('existingUser', existingUser);
      return res.status(409).json({message: 'user already exists'})
    }


    const password = req.body.password.toString();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    //also adds phno
    const newUser = new Users({ ...req.body, password: hash });

    const userEmail = req.body.email

    console.log('userEmail>', userEmail);
    

    const savedUser = await newUser.save();
    console.log("savedUser", savedUser );

    //send Otp
    // const otpResponse = await sendOtp({phno, name: savedUser.uname })
    // if (otpResponse) {
    // res.status(200).json({ message: "OTP sent to your mobile number, please check your inbox"});
    // }else{
    //   res.status(500).json({message: "an error occured during otp verfication"});
    // }
    


    //send token via mail
    const mailresponse = await sendEmail({email:userEmail, emailType: "VERIFY", userId: savedUser._id})

    console.log('mailresponse>>>>>>', mailresponse);
    if (mailresponse) {
    res.status(200).json({ message: "Verification mail sent, please check your inbox"});
    }else{
      res.status(500).json({message: "an error occured during email verfication"});
    }

  } catch (err) {
    console.log(err);
    res.status(409).send(err.message);
  }
});

// export const signupGoogle = async (req, res) => {
//   try {
//     const { code } = req.body;

//     const { user, token, refreshToken } = await handleGoogleAuth(code);

//     user.refreshToken = refreshToken;
//     await user.save();

//     res.cookie('access_token', token, { httpOnly: true });
//     res.status(200).json({ message: 'Sign up successful', user });
//   } catch (err) {
//     console.error('Error during Google signup:', err);
//     res.status(500).json({ message: 'Error while handling Google authentication' });
//   }
// };

//signin
export const signinGoogle = async (req, res) => {
  try {
    const { code } = req.body;

  


     // Determine the redirect_uri based on the request origin
     const origin = req.headers.origin;



     let redirectUri;
     if (origin === 'http://localhost:5173') {
      console.log('process.env.GOOGLE_REDIRECT_URI_LOCAL_5173', process.env.GOOGLE_REDIRECT_URI_LOCAL_5173);
       redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
     } else if (origin === 'http://localhost:5174') {
      console.log('process.env.GOOGLE_REDIRECT_URI_LOCAL_5174>>>>>>', process.env.GOOGLE_REDIRECT_URI_LOCAL_5174);
       redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
     } else {
       redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD; // Default to production
     }

    const { user, token } = await handleGoogleAuth(code, redirectUri);





    res.cookie('access_token', token, { httpOnly: true });
    res.status(200).json({ message: 'Sign in successful', user, token });
  } catch (err) {
    console.error('Error during Google sign-in:', err);
    res.status(500).json({ message: 'Error while handling Google authentication' });
  }
};



export const linkGoogleAccount = async (req, res) => {
  try {
    const { code, userId } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri;
    if (origin === 'http://localhost:5173') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === 'http://localhost:5174') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD; // Default to production
    }

    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
    const { id_token, refresh_token } = tokens;

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;



    // Find the existing user by their ID
    let user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //DOUBT:
    // Update the user with Google account details
    // user.email = email; // Update email if needed
    if (!user.avatar) {
      user.avatar = payload.picture;
    }
    // user.uname = payload.name;
    user.isGoogleUser = true; // Flag to indicate Google sign-up
    user.refreshToken = refresh_token;

    await user.save();

    res.status(200).json({ message: 'Google account linked successfully', user });
  } catch (err) {
    console.error('Error during Google account linking:', err);
    res.status(500).json({ message: 'Error while handling Google account linking' });
  }
};



export const linkGoogleAccountCompany = async (req, res) => {
  try {
    const { code } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri;
    if (origin === 'http://localhost:5173') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === 'http://localhost:5174') {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD_COMPANY; // Default to production
    }

    const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
    const { id_token, refresh_token } = tokens;

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    //Find the existing company by their ID
    let company = await Company.findById(req.company.id)

    if (!company) {
      return res.status(404).json({ message: 'User not found' });
    }

    company.isGoogleUser = true; // Flag to indicate Google sign-up
    company.refreshToken = refresh_token;

    await company.save();

    // // Find the existing user by their ID
    // let user = await Users.findById(userId);

    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    // //DOUBT:
    // // Update the user with Google account details
    // user.email = email; // Update email if needed
    // if (!user.avatar) {
    //   user.avatar = payload.picture;
    // }
    // // user.uname = payload.name;
    // user.isGoogleUser = true; // Flag to indicate Google sign-up
    // user.refreshToken = refresh_token;

    // await user.save();

    res.status(200).json({ message: 'Google account of company linked successfully', company });
  } catch (err) {
    console.error('Error during Google account linking:', err);
    res.status(500).json({ message: 'Error while handling Google account linking' });
  }
};





export const signin = AsyncHandler(async (req, res) => {
  try {

    const email = req.body.email.trim();

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'user not found' });
    }

    if (!user.isVerfied) {
      return res.status(401).json({ message: 'please verify your account' });
    }

    const isCorrect = await bcrypt.compare(
      req.body.password.toString(),
      user.password
    );

    if (!isCorrect) {
      throw new ApiError(409, "incorrect password");
    } else {
      const { password, ...others } = user._doc;
      const token = jwt.sign({ id: user._id }, process.env.JWT);

      console.log('token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', token);

      return res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json({ others, token });
    }
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).send(err.message);
  }
});


export const signinadmin = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      throw new ApiError(409, "incorrect email");
    }
    const isCorrect = await bcrypt.compare(
      req.body.password.toString(),
      user.password
    );
    if (!isCorrect) {
      throw new ApiError(409, "incorrect password");
    } else if (user.role !== "admin") {
      throw new ApiError(409, "user is not an admin");
    } else {
      const { password, ...others } = user._doc;
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json({ others, token });
    }
  } catch (err) {
    console.log(err);
    res.status(err.statusCode).send(err.message);
  }
};

//teacher

export const CompanyAuth = async (req, res, next) => {
  try {
    const user = await Users.findById({ _id: req.user.id });

    if (!user || user.role !== "company") {
      console.log("You are not authorized to make changes.");
      return res
        .status(403)
        .json({ message: "You are not authorized to make changes." });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res
      .cookie("access_token", null, {
        httpOnly: true,
        expires: new Date(0),
      })
      .status(200)
      .json({message: "Logged Out Successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while logging out. Please try again" });
  }
};

export const resetPassword = async (req, res, next) => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetpasswordtoken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const resetpasswordexipre = Date.now() + 15 * 60 * 1000;

  const User = await Users.findOne({
    email: req.body.email,
  });
  try {
    if (!User) {
      console.log("User not found");
    } else { 
      const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/auth/v1/password/reset/${resetToken}`;

      User.resetpasswordtoken = resetpasswordtoken;
      User.resetPasswordUrl = resetPasswordUrl;
      User.resetpasswordexipre = resetpasswordexipre;

      await User.save({ validateBeforeSave: false });

      const message = `Your OTP to reset password: \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore`;

      await sendEmail({
        email: User.email,
        subject: "Ecommerce Password Recovery",
        message,
      });

      res.status(200).json(`Email sent to ${User.email} successfully`);
    }
  } catch (error) {
    User.resetpasswordtoken = undefined;
    User.resetpasswordexipre = undefined;

    await User.save({ validateBeforeSave: false });
    console.log(error);
  }
};

export const resetPass = async (req, res) => {
  const resetpasswordtoken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const User = await Users.findOne({
    resetpasswordtoken,
    resetpasswordexipre: { $gt: Date.now() },
  });

  if (!User) {
    console.log("user not found");
  } else {
    if (req.body.password !== req.body.confirmPassword) {
      console.log("Password do not match");
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    User.password = hash;
    User.resetpasswordtoken = undefined;
    User.resetpasswordexipre = undefined;

    await User.save();
    res.status(200).json("password reset successful");
  }
};
