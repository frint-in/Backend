import jwt from "jsonwebtoken";
import Users from "./models/Users.js";
import dotenv from 'dotenv'
import { google } from 'googleapis';

dotenv.config()


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.DOMAIN
);


export const verifyToken = async (req, res, next) => {
  const token = req.cookies.access_token
  if(!token){
   return res.status(401).json({ error: 'Error in access_token' });
}

  await jwt.verify(token, process.env.JWT, async (err, user) => {
   if (err){
       
       return res.status(401).json({ error: 'Error in verifying token' });
   }
   else{
       req.user = user

       const dbUser = await Users.findById(user.id);
       if (!dbUser) {
         return res.status(404).json({ error: 'User not found' });
       }

       console.log('dbuser>>>>>>>>>>', dbUser);

       if (dbUser.isGoogleUser) {
          // Set credentials with the refresh token
          oauth2Client.setCredentials({ refresh_token: dbUser.refreshToken });
  
          // Check if the access token has expired
          if (oauth2Client.isTokenExpiring()) {
            // Refresh the access token
            const tokens = await oauth2Client.refreshAccessToken();
            const newAccessToken = tokens.credentials.access_token;
      
            // Update the access token in the JWT cookie
            const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
              expiresIn: '1h' // Adjust expiration time as needed
            });
      
            res.cookie('access_token', newToken, { httpOnly: true });
      
            // Update credentials with the new access token
            oauth2Client.setCredentials({ access_token: newAccessToken });
          }
       }
       next()
   }
  })
}


//   export const verifyToken = (req, res, next) => {
//     const token = req.cookies.access_token
//     if(!token){
//      return res.status(401).json({ error: 'Error in access_token' });
//  }
 
//     jwt.verify(token, process.env.JWT, (err, user) => {
//      if (err){
         
//          return res.status(401).json({ error: 'Error in verifying token' });
//      }
//      else{
//          req.user = user
//          next()
//      }
//     })
//  }

export const verifyCompanyToken = (req, res, next) => {
    const token = req.cookies.access_token_company
    if(!token){
        return res.status(401).json({ error: 'Error in access_token' });
    }
 
    jwt.verify(token, process.env.JWT, (err, company) => {
     if (err){
        return res.status(401).json({ error: 'Error in verifying token' });
     }
     else{
         req.company = company
         next()
     }
    })
 }

 export const verifyDownloadToken = (req, res, next) => {
   const token1 = req.cookies.access_token
    const token2 = req.cookies.access_token_company
    if(!token1 || !token2){
        return res.status(401).json({ error: 'Error in access_token' });
    }

    if (token1) {
        jwt.verify(token1, process.env.JWT, (err, user) => {
            if (err){
                
                return res.status(401).json({ error: 'Error in verifying token' });
            }
            else{
                req.user = user
                next()
            }
           })
    }

    if (token2) {        
        jwt.verify(token2, process.env.JWT, (err, company) => {
         if (err){
            return res.status(401).json({ error: 'Error in verifying token' });
         }
         else{
             req.company = company
             next()
         }
        })
    }
 
 }