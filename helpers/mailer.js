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
            // host: "live.smtp.mailtrap.io",
            // port: 587,
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "39a6696ffdd3e3",
              pass: "9893c6959d2a1e"
            //   user: process.env.EMAIL_USERNAME,
            //   pass: process.env.EMAIL_PASSWORD
            }
          });


        const mailOptions = {
            from: 'frint@gmail.com',
            // from: 'mailtrap@demomailtrap.com',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`
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