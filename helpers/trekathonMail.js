import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.in/";
const token = process.env.ZEPTO_MAIL_TOKEN;

const client = new SendMailClient({ url, token });

export const sendCompanyInterestConfirmationEmail = async (companyData) => {
  const {
    eventCompanyName,
    eventCompanyPocName,
    eventCompanyPocEmail,
    eventCompanyRole,
    eventCompanyProblemStatement,
    eventCompanyPreferredCollege,
    eventCompanyPlanType,
    eventCompanySponserAmount,
    eventCompanyMessage
  } = companyData;

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2196F3; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Thank You for Your Interest!</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px; margin-top: 20px;">
        <p style="font-size: 16px; color: #333;">Dear ${eventCompanyPocName},</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for expressing interest in collaborating with Frint for the Trekathon. We have successfully received your details for ${eventCompanyName}.
        </p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="color: #2196F3; margin-top: 0;">Received Details:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Company Role:</strong> ${eventCompanyRole}</li>
            ${eventCompanyPlanType ? `<li><strong>Sponsorship Amount:</strong> ₹${eventCompanyPlanType}</li>` : ''}
            ${eventCompanySponserAmount ? `<li><strong>Sponsorship Amount:</strong> ₹${eventCompanySponserAmount}</li>` : ''}
            ${eventCompanyProblemStatement ? `<li><strong>Problem Statement:</strong> ${eventCompanyProblemStatement}</li>` : ''}
            ${eventCompanyPreferredCollege ? `<li><strong>Preferred College:</strong> ${eventCompanyPreferredCollege}</li>` : ''}
            ${eventCompanyMessage ? `<li><strong>Message:</strong> ${eventCompanyMessage}</li>` : ''}
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Our outreach team will review your information and contact you shortly to discuss potential collaboration opportunities. We're excited about the possibility of working together!
        </p>
        
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="color: #2196F3; margin-top: 0;">Next Steps:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li>Our team will review your details</li>
            <li>We'll reach out to schedule an initial discussion</li>
            <li>We'll explore how we can best collaborate together</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">
          If you have any immediate questions, feel free to reach out to us at office@frint.in
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666;">
        <p>Best regards,<br>Team Frint</p>
        <p style="font-size: 12px; margin-top: 20px;">&copy; ${new Date().getFullYear()} Frint. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await client.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM_ADDRESS,
        name: "Frint Trekathon"
      },
      to: [
        {
          email_address: {
            address: eventCompanyPocEmail,
            name: eventCompanyPocName
          }
        }
      ],
      subject: `Thank You for Your Interest in Trekathon`,
      htmlbody: htmlTemplate,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendTeamInvitationEmail = async (memberEmail, teamDetails) => {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2196F3; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Team Invitation</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px; margin-top: 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          You have been invited to join team "${teamDetails.teamName}" for Trekathon 2024!
        </p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="color: #2196F3; margin-top: 0;">Team Details:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Team Id:</strong> ${teamDetails.teamId}</li>
            <li><strong>Team Leader:</strong> ${teamDetails.teamLeadEmail}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://trekathon.frint.in/layout/team" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Confirm Your Participation
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await client.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM_ADDRESS,
        name: "Frint Trekathon"
      },
      to: [{ email_address: { address: memberEmail } }],
      subject: "Team Invitation - Trekathon 2024",
      htmlbody: htmlTemplate,
    });
    return true;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return false;
  }
};

export const sendTeamCreationEmail = async (teamDetails) => {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2196F3; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Team Created Successfully!</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px; margin-top: 20px;">
        <p style="font-size: 16px; color: #333;">Dear Team Leader,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Your team has been successfully created for Trekathon 2024. Here are your team details:
        </p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="color: #2196F3; margin-top: 0;">Team Information:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Team ID:</strong> ${teamDetails.teamId}</li>
            <li><strong>Team Leader:</strong> ${teamDetails.teamLeadEmail}</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">
          You can manage your team by visiting <a href="https://trekathon.frint.in/layout/team">your team dashboard</a>.
        </p>
      </div>
    </div>
  `;

  try {
    await client.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM_ADDRESS,
        name: "Frint Trekathon"
      },
      to: [{ email_address: { address: teamDetails.teamLeadEmail } }],
      subject: "Team Created Successfully - Trekathon 2024",
      htmlbody: htmlTemplate,
    });
    return true;
  } catch (error) {
    console.error("Error sending team creation email:", error);
    return false;
  }
};

export const sendTeamDeletionEmail = async (teamDetails, allEmails) => {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2196F3; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Team Deleted</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f5f5f5; border-radius: 5px; margin-top: 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          This is to inform you that the team "${teamDetails.teamName}" has been deleted from Trekathon 2024.
        </p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="color: #2196F3; margin-top: 0;">Team Details:</h3>
          <ul style="color: #555; line-height: 1.6;">
            <li><strong>Team Name:</strong> ${teamDetails.teamName}</li>
            <li><strong>Team ID:</strong> ${teamDetails.teamId}</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">
          You can create another team by visiting <a href="https://trekathon.frint.in/layout/team">Trekathon dashboard</a>.
        </p>
      </div>
    </div>
  `;

  try {
    await client.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM_ADDRESS,
        name: "Frint Trekathon"
      },
      to: allEmails.map(email => ({ 
        email_address: { address: email }
      })),
      subject: "Team Deleted - Trekathon 2024",
      htmlbody: htmlTemplate,
    });
    return true;
  } catch (error) {
    console.error("Error sending team deletion email:", error);
    return false;
  }
};

