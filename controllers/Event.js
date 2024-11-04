import Event2 from "../models/Event.js";
import { v4 as uuidv4 } from "uuid";
import Users from "../models/Users.js";

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

  try {
    let team = await Event2.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (teamName) team.teamName = teamName;
    if (teamLeadEmail && teamLeadEmail !== team.teamLeadEmail) {
      team.teamLeadEmail = teamLeadEmail;
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
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
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
