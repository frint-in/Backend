import mongoose from "mongoose";
import Users from "../models/Users.js";
import Company from "../models/Company.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { resolveContent } from "nodemailer/lib/shared/index.js";
import dotenv from "dotenv";

import { sendEmail } from "../helpers/mailer.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { generateRandomString } from "../utils/Oauth.js";
import { sendOtpTwilio } from "../helpers/sendSms.js";

import { google } from "googleapis";
import handleGoogleAuth from "../helpers/googleAuth.js";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);

//student

export const signup = AsyncHandler(async (req, res) => {
  try {
    const { phno } = req.body;

    const existingUser = await Users.findOne({ phno });

    if (existingUser) {
      console.log("existingUser", existingUser);
      return res.status(409).json({ message: "user already exists" });
    }

    const password = req.body.password.toString();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    //also adds phno
    const newUser = new Users({ ...req.body, password: hash });

    const userEmail = req.body.email;

    console.log("userEmail>", userEmail);

    const savedUser = await newUser.save();
    console.log("savedUser", savedUser);

    //send Otp
    // const otpResponse = await sendOtp({phno, name: savedUser.uname })
    // if (otpResponse) {
    // res.status(200).json({ message: "OTP sent to your mobile number, please check your inbox"});
    // }else{
    //   res.status(500).json({message: "an error occured during otp verfication"});
    // }

    //send token via mail
    // const mailresponse = await sendEmail({
    //   email: userEmail,
    //   emailType: "VERIFY",
    //   userId: savedUser._id,
    // });

    // console.log("mailresponse>>>>>>", mailresponse);
    // if (mailresponse) {
    //   res
    //     .status(200)
    //     .json({ message: "Verification mail sent, please check your inbox" });
    // } else {
    //   res
    //     .status(500)
    //     .json({ message: "an error occured during email verfication" });
    // }
    if (savedUser) {
      // console.log("Saved User", savedUser.isVerfied)
      return res.status(200).json({ message: "Account account Created" });
    } else {
      return res.status(404).json({ message: "Failed in creating account" });
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
    if (origin === "http://localhost:5173") {
      console.log(
        "process.env.GOOGLE_REDIRECT_URI_LOCAL_5173",
        process.env.GOOGLE_REDIRECT_URI_LOCAL_5173
      );
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === "http://localhost:5174") {
      console.log(
        "process.env.GOOGLE_REDIRECT_URI_LOCAL_5174>>>>>>",
        process.env.GOOGLE_REDIRECT_URI_LOCAL_5174
      );
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD; // Default to production
    }

    const { user, token } = await handleGoogleAuth(code, redirectUri);
    console.log("Google Token", token);
    res.cookie("access_token", token, { httpOnly: true });
    res.status(200).json({ message: "Sign in successful", user, token });
  } catch (err) {
    console.error("Error during Google sign-in:", err);
    res
      .status(500)
      .json({ message: "Error while handling Google authentication" });
  }
};

export const linkGoogleAccount = async (req, res) => {
  try {
    const { code, userId } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri;
    if (origin === "http://localhost:5173") {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === "http://localhost:5174") {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD; // Default to production
    }

    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });
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
      return res.status(404).json({ message: "User not found" });
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

    res
      .status(200)
      .json({ message: "Google account linked successfully", user });
  } catch (err) {
    console.error("Error during Google account linking:", err);
    res
      .status(500)
      .json({ message: "Error while handling Google account linking" });
  }
};

export const linkGoogleAccountCompany = async (req, res) => {
  try {
    const { code, userId } = req.body;

    // Determine the redirect_uri based on the request origin
    const origin = req.headers.origin;

    let redirectUri;
    if (origin === "http://localhost:5173") {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5173;
    } else if (origin === "http://localhost:5174") {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_LOCAL_5174;
    } else if (
      origin === "https://company.frint.in" ||
      origin === "https://www.company.frint.in"
    ) {
      redirectUri = process.env.GOOGLE_REDIRECT_URI_PROD_COMPANY;
    } else {
      return res.status(400).json({ message: "Invalid origin URL" });
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });

    const { id_token, refresh_token } = tokens;

    // Verify the ID token and get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Find the existing company by their ID
    let company = await Company.findById(req.company?.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Update the company details with Google account information
    if (!company.email) {
      company.email = email; // Update email if needed
    }
    if (!company.avatar) {
      company.avatar = payload.picture; // Update avatar if available
    }
    company.isGoogleUser = true; // Flag to indicate Google sign-up
    company.refreshToken = refresh_token;

    await company.save();

    res.status(200).json({
      message: "Google account linked successfully for company",
      company,
    });
  } catch (err) {
    console.error("Error during Google account linking for company:", err);
    res.status(500).json({
      message: "Error while handling Google account linking for company",
    });
  }
};

export const signin = AsyncHandler(async (req, res) => {
  try {
    const email = req.body.email.trim();

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (!user.isVerfied) {
      return res.status(401).json({ message: "please verify your account" });
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

      console.log("token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", token);

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
      .json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error while logging out. Please try again" });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    // Find the user by email
    const user = await Users.findOne({ email: req.body.email });

    // If user not found, send error message
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign({ userId: user._id }, process.env.JWT, {
      expiresIn: "60m",
    });

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="https://student.frint.in/reset-password/${token}">https://student.frint.in/reset-password</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Reset Link sent to Email" });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const forgetPasswordTrek = async (req, res) => {
  try {
    // Find the user by email
    const user = await Users.findOne({ email: req.body.email });

    // If user not found, send error message
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign({ userId: user._id }, process.env.JWT, {
      expiresIn: "60m",
    });

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="https://trekathon.frint.in/reset-password/${token}">https://trekathon.frint.in/reset-password</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Reset Link sent to Email" });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Verify the token sent by the user
    const decodedToken = jwt.verify(req.params.token, process.env.JWT);

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await Users.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "no user found" });
    }
    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt);
    const password = req.body.newPassword;
    // Update user's password, clear reset token and expiration time
    user.password = password;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated Successfully" });
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
};

export const GoogleFirebase = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT, {
        expiresIn: "24h", // Set an expiration time for the token if necessary
      });
      return res
        .cookie("access_token", token, {
          httpOnly: true, // Secure cookie settings
        })
        .status(200)
        .json({ message: "Sign-in successful", user: existingUser, token });
    } else {
      const newUser = new Users({ ...req.body });
      const savedUser = await newUser.save();
      if (savedUser) {
        return res.status(200).json({
          message: "Account created successfully",
        });
      } else {
        return res.status(404).json({ message: "Failed to create account" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const Welcome = AsyncHandler(async (req, res) => {
  try {
    const { email, password, phno, ...otherDetails } = req.body;
    
    // Find if user exists
    const existingUser = await Users.findOne({ email });

    // If user exists, verify and send token
    if (existingUser) {
      // Verify password
      const isCorrect = await bcrypt.compare(
        password.toString(),
        existingUser.password
      );

      if (!isCorrect) {
        throw new ApiError(409, "incorrect password");
      }

      if (!existingUser.isVerfied) {
        return res.status(401).json({ message: "please verify your account" });
      }

      const { password: userPassword, ...others } = existingUser._doc;
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT);

      return res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json({ 
          message: "Welcome back! Logged in successfully",
          user: others, 
          token 
        });
    }

    // If user doesn't exist, create new account
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password.toString(), salt);

    const newUser = new Users({ 
      email,
      password: hash,
      phno,
      ...otherDetails
    });

    const savedUser = await newUser.save();

    if (savedUser) {
      const { password: userPassword, ...others } = savedUser._doc;
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);

      return res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(201)
        .json({
          message: "Welcome! Account created successfully",
          user: others,
          token
        });
    } else {
      return res.status(400).json({ message: "Failed to create account" });
    }

  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({
      message: err.message || "An error occurred during authentication"
    });
  }
});
