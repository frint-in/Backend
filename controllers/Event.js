import Event2 from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import Users from "../models/Users.js";
import EventCompany from "../models/EventCompany.js";
import { sendCompanyInterestConfirmationEmail, sendTeamCreationEmail, sendTeamDeletionEmail, sendTeamInvitationEmail } from '../helpers/trekathonMail.js';
import TrekPS from "../models/TrekPS.js";

export const createGroup = async (req, res) => {
  const { email } = req.body;
  try {
    let existingTeam = await Event2.findOne({
      $or: [{ teamLeadEmail: email }, { "Members.userEmail": email }],
    });

    if (existingTeam) {
      return res.status(200).json({
        message: "Existing team found",
        team: existingTeam,
      });
    }

    const teamId = uuidv4();
    const newTeam = new Event2({
      teamId,
      teamName: "",
      teamLeadEmail: email,
      Members: [],
      problemStatement: "",
      githubRepo: "",
      youtubeLink: "",
    });

    const savedTeam = await newTeam.save();
    await sendTeamCreationEmail(savedTeam);
    res.status(201).json({
      message: "Team created successfully",
      team: savedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating team",
      error: error.message,
    });
  }
};

export const updateGroup = async (req, res) => {
  const { teamId, teamName, teamLeadEmail, userEmails } = req.body;

  // Validate required fields
  if (!teamId) {
    return res.status(400).json({ message: "Team ID is required" });
  }

  try {
    // Find the team by ID
    const team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Update team name if provided
    if (teamName) {
      team.teamName = teamName;
    }

    // Update team lead email if provided and different from current
    if (teamLeadEmail && teamLeadEmail !== team.teamLeadEmail) {
      team.teamLeadEmail = teamLeadEmail;
    }

    // Track skipped emails and successfully added emails
    const skippedEmails = [];
    const addedEmails = [];

    if (userEmails && Array.isArray(userEmails)) {
      // Process each email in userEmails list
      for (let email of userEmails) {
        try {
          // Check if the email is a team lead in any team
          const isTeamLead = await Event2.findOne({
            teamLeadEmail: email
          });

          if (isTeamLead) {
            skippedEmails.push(email);
            continue;
          }

          // Check if the email is in another team
          const isInAnotherTeam = await Event2.findOne({
            "Members.userEmail": email,
            teamId: { $ne: teamId }, // Exclude current team
          });

          // Skip if email is in another team
          if (isInAnotherTeam) {
            skippedEmails.push(email);
            continue;
          }

          // Add to pending members if not already in team
          const existingMember = team.Members.find((m) => m.userEmail === email);
          if (!existingMember && email !== team.teamLeadEmail) {
            team.Members.push({
              userEmail: email,
              status: "pending",
            });
            await sendTeamInvitationEmail(email, team);
            addedEmails.push(email);
          }
        } catch (checkError) {
          console.error(`Error checking email ${email}:`, checkError);
          skippedEmails.push(email);
        }
      }
    }

    // Save updated team
    const updatedTeam = await team.save();

    // Prepare response message
    const responseMessage = {
      message: "Team updated successfully",
      team: updatedTeam,
      updates: {
        addedMembers: addedEmails,
        skippedMembers: skippedEmails,
        skippedReasons: skippedEmails.length > 0 ? 
          "Emails were skipped because they are either team leads or already members in other teams" : null
      },
    };

    // Add explanation for skipped emails if any
    if (skippedEmails.length > 0) {
      responseMessage.message += ` (${skippedEmails.length} email(s) skipped)`;
    }

    res.status(200).json(responseMessage);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({
      message: "Error updating team",
      error: error.message,
    });
  }
};



export const inviteToGroup = async (req, res) => {
  const { teamId, userEmails } = req.body;
  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (userEmails && Array.isArray(userEmails)) {
      userEmails.forEach((email) => {
        const existingMember = team.Members.find((m) => m.userEmail === email);
        if (!existingMember && email !== team.teamLeadEmail) {
          team.Members.push({
            userEmail: email,
            status: "pending",
          });
        }
      });
    }

    const updatedTeam = await team.save();
    res.status(200).json({
      message: "Invitations sent successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error inviting members to group",
      error: error.message,
    });
  }
};

export const removeFromGroup = async (req, res) => {
  const { teamId, email } = req.body;
  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const memberIndex = team.Members.findIndex(
      (m) => m.userEmail === email && (m.status === "confirmed" || m.status === "pending")
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        message: "Confirmed member not found",
      });
    }

    team.Members.splice(memberIndex, 1);
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "Member removed from group",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error removing member from group",
      error: error.message,
    });
  }
};

export const joinGroup = async (req, res) => {
  const { teamId, email } = req.body;
  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const existingMember = team.Members.find((m) => m.userEmail === email);
    existingMember.status = "confirmed";
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "Joined group successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error joining group",
      error: error.message,
    });
  }
};


export const rejectGroup = async (req, res) => {
  const { teamId, email } = req.body;
  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const memberIndex = team.Members.findIndex(
      (m) => m.userEmail === email && m.status === "pending"
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        message: "Pending invitation not found",
      });
    }

    team.Members.splice(memberIndex, 1);
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "Invitation rejected",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error rejecting invitation",
      error: error.message,
    });
  }
};

export const leaveGroup = async (req, res) => {
  const { teamId, email } = req.body;
  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const memberIndex = team.Members.findIndex(
      (m) => m.userEmail === email && m.status === "confirmed"
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    team.Members.splice(memberIndex, 1);
    const updatedTeam = await team.save();
    res.status(200).json({
      message: "Left group successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error leaving group",
      error: error.message,
    });
  }
};

export const getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event2.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get emails of members with pending status
    const pendingMembersEmails = event.Members.filter(
      (member) => member.status === "pending"
    ).map((member) => member.userEmail);

    const users = await Users.find(
      { email: { $in: pendingMembersEmails } },
      "uname email"
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      message: "An error occurred while fetching user details",
    });
  }
};

export const getGroupDetail = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.email;
    const team = await Event2.findOne({
      $or: [{ teamLeadEmail: userEmail }, { "Members.userEmail": userEmail }],
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found for this user",
      });
    }

    res.status(200).json({
      message: "Team details retrieved successfully",
      team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving team details",
      error: error.message,
    });
  }
};

export const getGroups = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id, "email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find groups where the user has a pending status
    const groups = await Event2.find(
      {
        Members: {
          $elemMatch: {
            userEmail: user.email,
            status: "pending",
          },
        },
      },
      "teamId teamName"
    );

    res.status(200).json({
      groups: groups.map((group) => ({
        teamId: group.teamId,
        teamName: group.teamName,
      })),
    });
  } catch (error) {
    console.error("Error retrieving groups:", error);
    res.status(500).json({
      message: "An error occurred while fetching groups",
    });
  }
};

export const deleteGroup = async (req, res) => {
  const { teamId } = req.body;
  try {
    const deletedGroup = await Event2.findOneAndDelete({ teamId });
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    const allEmails = [
      deletedGroup.teamLeadEmail,
      ...deletedGroup.Members.map(member => member.userEmail)
    ];
    await sendTeamDeletionEmail(deletedGroup, allEmails);
    res
      .status(200)
      .json({ message: "Group deleted successfully", deletedGroup });
  } catch (error) {
    console.error("Error deleting group:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the group" });
  }
};


export const postCompanyInterest = async (req, res) => {
  try {
    const companyInterest = new EventCompany(req.body);
    const savedCompanyInterest = await companyInterest.save();
    
    // Send confirmation email
    await sendCompanyInterestConfirmationEmail(req.body);

    res.status(201).json({
      success: true,
      message: "Message Sent successfully",
      data: savedCompanyInterest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to Send Message",
      error: error.message,
    });
  }
};

export const addPreferredProblemStatement = async (req, res) => {
  const { teamId, preferredProblemStatement } = req.body;
  try {
    const team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if team already has a confirmed problem statement
    if (team.problemStatement) {
      return res.status(400).json({ 
        message: "Cannot add preferred problem statements after confirming one" 
      });
    }

    // Create a new Set to handle duplicates
    const uniqueStatements = new Set([
      ...(team.preferredProblemStatement || []),
      ...preferredProblemStatement
    ]);

    // Convert back to array
    const updatedStatements = Array.from(uniqueStatements);

    // Check if total length exceeds 3
    if (updatedStatements.length > 3) {
      return res.status(400).json({ 
        message: "Maximum 3 preferred problem statements allowed per team" 
      });
    }

    // Update the team's preferred statements
    team.preferredProblemStatement = updatedStatements;
    await team.save();
    
    res.status(200).json({ 
      message: "Problem Statement added to wishlist",
      preferredProblemStatement: team.preferredProblemStatement
    });
  } catch (error) {
    console.error("Error updating preferred problem statements:", error);
    res.status(500).json({ 
      message: "An error occurred while updating preferred problem statements" 
    });
  }
};

export const removePreferredProblemStatement = async (req, res) => {
  const { teamId, problemStatement } = req.body;
  try {
    const team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.preferredProblemStatement = team.preferredProblemStatement.filter(
      (statement) => statement !== problemStatement
    );
    
    await team.save();
    res.status(200).json({ 
      message: "Problem statement removed successfully",
      preferredProblemStatement: team.preferredProblemStatement
    });
  } catch (error) {
    console.error("Error removing problem statement:", error);
    res.status(500).json({ 
      message: "An error occurred while removing the problem statement" 
    });
  }
};

export const confirmProblemStatement = async (req, res) => {
  const { teamId, problemStatement } = req.body;
  try {
    const team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if the problem statement exists in preferred list
    if (!team.preferredProblemStatement.includes(problemStatement)) {
      return res.status(400).json({ 
        message: "Selected problem statement is not in your preferred list" 
      });
    }

    // Check if 12 teams have already confirmed this specific problem statement
    const teamsWithSamePS = await Event2.countDocuments({ 
      problemStatement: problemStatement 
    });

    if (teamsWithSamePS >= 12) {
      return res.status(400).json({
        message: "This problem statement has reached its maximum limit of 12 teams and is now locked"
      });
    }

    // Update the confirmed problem statement
    team.problemStatement = problemStatement;
    
    // Clear the preferred problem statements after confirmation
    team.preferredProblemStatement = [];
    
    await team.save();
    
    res.status(200).json({ 
      message: "Problem statement confirmed successfully",
      team,
      remainingSlots: 12 - (teamsWithSamePS + 1)
    });
  } catch (error) {
    console.error("Error confirming problem statement:", error);
    res.status(500).json({ 
      message: "An error occurred while confirming the problem statement" 
    });
  }
};

export const getProblemStatementCounts = async (req, res) => {
  try {
    // Get all teams
    const teams = await Event2.find({});
    
    // Initialize counters
    const counts = {
      preferred: {
        total: 0,
        byStatement: {}
      },
      confirmed: {
        total: 0,
        byStatement: {}
      }
    };
    
    // Count preferred problem statements
    teams.forEach(team => {
      if (team.preferredProblemStatement && Array.isArray(team.preferredProblemStatement)) {
        team.preferredProblemStatement.forEach(statement => {
          counts.preferred.total++;
          counts.preferred.byStatement[statement] = (counts.preferred.byStatement[statement] || 0) + 1;
        });
      }
      
      // Count confirmed problem statements
      if (team.problemStatement) {
        counts.confirmed.total++;
        counts.confirmed.byStatement[team.problemStatement] = 
          (counts.confirmed.byStatement[team.problemStatement] || 0) + 1;
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Problem statement counts retrieved successfully",
      counts
    });
    
  } catch (error) {
    console.error("Error getting problem statement counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get problem statement counts",
      error: error.message
    });
  }
};

export const postProblemStatement = async (req, res) => {
  const { 
    title, 
    description, 
    requirements, 
    considerations, 
    domain,
    difficulty,
    expectedDuration,
    resources,
    tags 
  } = req.body;
  
  try {
    // Validate required fields
    if (!title || !description || !requirements || !domain || !difficulty || !expectedDuration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Validate requirements structure
    if (!requirements.objectives || !requirements.technicalRequirements || !requirements.deliverables) {
      return res.status(400).json({
        success: false,
        message: "Requirements must include objectives, technicalRequirements, and deliverables"
      });
    }

    // Create new problem statement
    const problemStatement = new TrekPS({
      title,
      description,
      requirements: {
        objectives: requirements.objectives,
        technicalRequirements: requirements.technicalRequirements,
        deliverables: requirements.deliverables
      },
      considerations: considerations || [],
      domain,
      difficulty,
      expectedDuration,
      resources: resources || [],
      tags: tags || [],
      status: 'active'
    });

    // Save to database
    const savedProblemStatement = await problemStatement.save();

    res.status(201).json({
      success: true,
      message: "Problem statement created successfully",
      data: savedProblemStatement
    });

  } catch (error) {
    console.error("Error creating problem statement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create problem statement",
      error: error.message
    });
  }
};

export const getAllProblemStatements = async (req, res) => {
  try {
    const { domain, difficulty, status } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;

    const problemStatements = await TrekPS.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: "Problem statements retrieved successfully",
      count: problemStatements.length,
      data: problemStatements
    });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem statements",
      error: error.message
    });
  }
};
