import { google } from 'googleapis';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';
dotenv.config()


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);


const handleGoogleAuth = async (code, redirectUri) => {
  const { tokens } = await oauth2Client.getToken({code, redirect_uri: redirectUri});
  const { id_token, refresh_token } = tokens;

  // Verify the ID token and get user info
  const ticket = await oauth2Client.verifyIdToken({
    idToken: id_token,
    audience: process.env.GOOGLE_CLIENT_ID,

  });
  const payload = ticket.getPayload();
  const email = payload.email;

  // Check if the user exists in the database
  let user = await Users.findOne({ email }).lean();

  if (!user) {
    // User does not exist, create a new one
    user = new Users({
      email,
      avatar: payload.picture,
      uname: payload.name,
      isGoogleUser: true, // Flag to indicate Google sign-up
      refreshToken: refresh_token,
      isVerfied: true
    });
    await user.save();
  }

  const {refreshToken, ...userWithoutRT} = user



  console.log('process.env.JWT_SECRET', process.env.JWT);

  // Generate a JWT token for the user
  const token = jwt.sign({ id: user._id }, process.env.JWT, {
    expiresIn: '1h' // Adjust expiration time as needed
  });

  return { user: userWithoutRT, token };
};

export default handleGoogleAuth;
