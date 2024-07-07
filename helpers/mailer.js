import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import Users from '../models/Users.js';



export const sendEmail = async({email, emailType, userId}) => {
    try {
        // create a hased token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {

            await Users.findByIdAndUpdate(userId, 
                {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000}) //token valid for 1hr
        } 
        
        
        else if (emailType === "RESET"){
            await Users.findByIdAndUpdate(userId, 
                {forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000})
        }

        var transport = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD
            }
          });


        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: #2196F3; padding: 10px 20px; color: white; text-align: center;">
                    <h1 style="margin: 0;">${emailType === "VERIFY" ? "Email Verification" : "Password Reset"}</h1>
                </div>
                <div style="padding: 20px; background-color: white;">
                    <p>Hi,</p>
                    <p>
                        Click the button below to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}:
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            ${emailType === "VERIFY" ? "Verify Email" : "Reset Password"}
                        </a>
                    </div>
                    <p>
                        Or copy and paste the following link into your browser:
                    </p>
                    <p style="word-break: break-all;">
                        <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}" style="color: #2196F3;">
                            ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
                        </a>
                    </p>
                    <p>
                        If you did not request this, please ignore this email.
                    </p>
                    <p>
                        Thanks,
                        <br>Team Frint
                    </p>
                </div>
                <div style="text-align: center; color: #777; padding: 10px 0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Frint. All rights reserved.</p>
                </div>
            </div>
        </div>
    `
        }

        // const mailresponse = await transport.sendMail
        // (mailOptions);

        const mailresponse   =  transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Message sent: %s', info.messageId);
        });

        console.log('mailresponse success>>>>>>', mailresponse);

        return mailresponse;

    } catch (error) {
        throw new Error("error in sending mail",error.message);
    }
}