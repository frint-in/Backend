import twilio from "twilio";
import Users from "../models/Users.js";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;

console.log('accountSid', accountSid);
console.log('authToken', authToken);
console.log('twilioNumber', twilioNumber);
const client = twilio(accountSid, authToken);

export const sendOtp = async ({ phno, name }) => {
  try {
    //create OTP
        //otp logic
        let digits = '0123456789'

        let OTP = ''
    
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random()*10)]
        }

        //save the OTP and put and expiry time of 5 mins
        await Users.findOneAndUpdate({phno}, {
            verifyOtp: OTP,
            verifyOtpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes from now
          });

        


    //send the OTP to the client via SMS
    const message = await client.messages.create({
      body: `Hello ${name}! Your OTP verification code is ${OTP}. The code expires in 5 mins`,
      from: `${twilioNumber}`,
      to: `+91${phno}`,
    });

    console.log("sms successfully sent>>>>>>>",message.body);

    return message.body

  } catch (err) {
    console.log("err while sending Sms>>>>>>", err);
  }
};
