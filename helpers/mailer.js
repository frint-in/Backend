import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import Users from "../models/Users.js";

export const sendEmail = async ({ email, emailType, userId }) => {
  try {
    // create a hashed token
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);

    if (emailType === "VERIFY") {
      await Users.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000, // token valid for 1hr
      });
    } else if (emailType === "RESET") {
      await Users.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject:
        emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                  <div style="background-color: #2196F3; padding: 10px 20px; color: white; text-align: center;">
                      <h1 style="margin: 0;">${
                        emailType === "VERIFY"
                          ? "Email Verification"
                          : "Password Reset"
                      }</h1>
                  </div>
                  <div style="padding: 20px; background-color: white;">
                      <p>Hi,</p>
                      <p>
                          Click the button below to ${
                            emailType === "VERIFY"
                              ? "verify your email"
                              : "reset your password"
                          }:
                      </p>
                      <div style="text-align: center; margin: 20px 0;">
                          <a href="${
                            process.env.DOMAIN
                          }/verifyemail?token=${hashedToken}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                              ${
                                emailType === "VERIFY"
                                  ? "Verify Email"
                                  : "Reset Password"
                              }
                          </a>
                      </div>
                      <p>
                          Or copy and paste the following link into your browser:
                      </p>
                      <p style="word-break: break-all;">
                          <a href="${
                            process.env.DOMAIN
                          }/verifyemail?token=${hashedToken}" style="color: #2196F3;">
                              ${
                                process.env.DOMAIN
                              }/verifyemail?token=${hashedToken}
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
        `,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("Message sent successfully: %s", info.messageId);

    return info.messageId;
  } catch (error) {
    throw new Error("error in sending mail: " + error.message);
  }
};

export const sendEmailMain = async ({
  email,
  emailType,
  userId,
  meetingDetails,
}) => {
  try {
    let emailContent;
    let hashedToken = null;

    switch (emailType) {
      case "VERIFY":
      case "RESET":
        hashedToken = await bcryptjs.hash(userId.toString(), 10);
        await updateUserToken(userId, emailType, hashedToken);
        break;
    }

    switch (emailType) {
      case "MEETING":
        emailContent = generateMeetingEmailContent(meetingDetails);
        break;
      case "VERIFY":
      case "RESET":
        emailContent = generateVerifyResetEmailContent(emailType, hashedToken);
        break;
      default:
        throw new Error("Invalid email type");
    }

    const transport = createTransport();
    const mailOptions = createMailOptions(email, emailType, emailContent);
    const info = await transport.sendMail(mailOptions);
    console.log("Message sent successfully: %s", info.messageId);

    return info.messageId;
  } catch (error) {
    throw new Error("Error in sending mail: " + error.message);
  }
};

const updateUserToken = async (userId, emailType, hashedToken) => {
  const updateObj =
    emailType === "VERIFY"
      ? { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 }
      : {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: Date.now() + 3600000,
        };

  await Users.findByIdAndUpdate(userId, updateObj);
};

const generateMeetingEmailContent = (meetingDetails) => {
  const {
    summary,
    description,
    startDateTime,
    endDateTime,
    location,
    meetingLink,
  } = meetingDetails;
  return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: #2196F3; padding: 10px 20px; color: white; text-align: center;">
                    <h1 style="margin: 0;">Meeting Scheduled</h1>
                </div>
                <div style="padding: 20px; background-color: white;">
                    <p>Hi,</p>
                    <p>A meeting has been scheduled with the following details:</p>
                    <ul>
                        <li><strong>Summary:</strong> ${summary}</li>
                        <li><strong>Description:</strong> ${description}</li>
                        <li><strong>Start Time:</strong> ${new Date(
                          startDateTime
                        ).toLocaleString()}</li>
                        <li><strong>End Time:</strong> ${new Date(
                          endDateTime
                        ).toLocaleString()}</li>
                        <li><strong>Location:</strong> ${location}</li>
                        <li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
                    </ul>
                    <p>Please be on time for the meeting.</p>
                    <p>Thanks,<br>Team Frint</p>
                </div>
                <div style="text-align: center; color: #777; padding: 10px 0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Frint. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
};

const generateVerifyResetEmailContent = (emailType, hashedToken) => {
  const actionText =
    emailType === "VERIFY" ? "verify your email" : "reset your password";
  const buttonText = emailType === "VERIFY" ? "Verify Email" : "Reset Password";

  return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
                <div style="background-color: #2196F3; padding: 10px 20px; color: white; text-align: center;">
                    <h1 style="margin: 0;">${
                      emailType === "VERIFY"
                        ? "Email Verification"
                        : "Password Reset"
                    }</h1>
                </div>
                <div style="padding: 20px; background-color: white;">
                    <p>Hi,</p>
                    <p>Click the button below to ${actionText}:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${
                          process.env.DOMAIN
                        }/verifyemail?token=${hashedToken}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            ${buttonText}
                        </a>
                    </div>
                    <p>Or copy and paste the following link into your browser:</p>
                    <p style="word-break: break-all;">
                        <a href="${
                          process.env.DOMAIN
                        }/verifyemail?token=${hashedToken}" style="color: #2196F3;">
                            ${
                              process.env.DOMAIN
                            }/verifyemail?token=${hashedToken}
                        </a>
                    </p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Thanks,<br>Team Frint</p>
                </div>
                <div style="text-align: center; color: #777; padding: 10px 0;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Frint. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
};

const createTransport = () => {
  return nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const createMailOptions = (email, emailType, emailContent) => {
  const subject =
    emailType === "VERIFY"
      ? "Verify your email"
      : emailType === "RESET"
      ? "Reset your password"
      : "Meeting Scheduled";

  return {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject,
    html: emailContent,
  };
};
