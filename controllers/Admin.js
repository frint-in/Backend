import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Internship from "../models/Internship.js";
import Company from "../models/Company.js";
import User from "../models/Users.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import EventCompany from "../models/EventCompany.js";
import Event from "../models/Event.js";

export const signupAdmin = AsyncHandler(async (req, res) => {
  try {
    const password = req.body.password.toString();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newAdmin = new Admin({
      ...req.body,
      password: hash,
    });
    await newAdmin.save();
    return res.status(200).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

export const signinAdmin = AsyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      throw new ApiError(409, "incorrect email");
    }
    const isCorrect = await bcrypt.compare(
      req.body.password.toString(),
      admin.password
    );
    if (!isCorrect) {
      throw new ApiError(409, "incorrect password");
    } else {
      const { password, ...others } = admin._doc;
      const token = jwt.sign({ id: admin._id }, process.env.JWT);
      res
        .cookie("access_token_admin", token, {
          httpOnly: true,
        })
        .status(200)
        .json({ message: "Logged in successfully", others });
    }
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

export const getInternship = async (req, res) => {
  try {
    const internship = await Internship.find();
    res.status(200).json(internship);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInternshipById = async (req, res) => {
  const { id } = req.params; 
  try {
    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getUserByInternship = async (req, res) => {
  try {
    const internshipId = req.params.id;
    const users = await User.find({
      "applications.internship": internshipId,
    }).populate({
      path: "applications.internship",
    });

    if (!users || users.length === 0) {
      throw new ApiError(404, "No users found for this internship");
    }

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.find();
    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCompanyById = async (req, res) => {
  const { id } = req.params; 
  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(company);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInternshipByCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate({
      path: "internships",
    });
    if (!company) {
      throw new ApiError(404, "Company not found");
    }
    res.status(200).json(company.internships);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params; 
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInternshipByUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "applications.internship"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const internshipsWithStatus = await Promise.all(
      user.applications.map(async (application) => {
        const internship = await Internship.findById(application.internship);
        return {
          internship,
          status: application.status,
        };
      })
    );
    res.status(200).json(internshipsWithStatus);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getLength = async (req, res) => {
  try {
    const intLength = await Internship.countDocuments();
    const userLength = await User.countDocuments();
    const comLength = await Company.countDocuments();
    const groupLength = await Event.countDocuments();
    res.status(200).json({
      internships: intLength,
      users: userLength,
      companies: comLength,
      groups: groupLength,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getCompanyInterest = async (req, res) => {
  try {
    const companies = await EventCompany.find(); // Fetch all companies
    res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Event.find();    
    const teamLeadEmails = groups.map(group => group.teamLeadEmail);
    const teamLeaders = await User.find(
      { email: { $in: teamLeadEmails } },
      { uname: 1, phno: 1, email: 1, address: 1, education: 1, skills: 1, resume: 1, preferences: 1 }
    );
    const teamLeaderMap = teamLeaders.reduce((acc, leader) => {
      acc[leader.email] = {
        uname: leader.uname,
        phno: leader.phno,
        address: leader.address,
        education: leader.education,
        skills: leader.skills,
        resume: leader.resume,
        preferences: leader.preferences,
      };
      return acc;
    }, {});
    const groupsWithLeaderDetails = groups.map(group => ({
      ...group.toObject(),
      teamLeader: teamLeaderMap[group.teamLeadEmail] || null
    }));
    res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      data: groupsWithLeaderDetails
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: error.message
    });
  }
};