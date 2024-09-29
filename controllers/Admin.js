import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Internship from "../models/Internship.js";
import Company from "../models/Company.js";
import User from "../models/Users.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const signupAdmin = AsyncHandler(async (req, res) => {
  try {
    // Hash the password
    const password = req.body.password.toString();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Create a new company
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

//signin

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

export const updateAdmin = AsyncHandler(async (req, res) => {
  console.log(req.admin.id);
  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    console.log("Admin is lost");
    return res.status(401).json({ message: "Are you lost baby FRINT" });
  }
  try {
    console.log("req body in form upload>>>>>>", req.body);

    const updates = {};

    // Iterate over fields from req.body and add to updates if not empty
    for (const key in req.body) {
      if (req.body[key] !== "") {
        updates[key] = req.body[key];
      }
    }
    const updateAdmin = await admin
      .findByIdAndUpdate(
        req.admin.id,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .lean();

    delete updateAdmin.password;
    delete updateAdmin.refreshToken;

    console.log("updateAdmin", updateAdmin);

    res.status(200).json({
      message: "Profile Edited Successfully",
      admin: updateAdmin,
    });
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).json({ message: err.message });
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

export const getUserByInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
    if (!internship) {
      throw new ApiError(409, "Internship not found");
    }
    res.status(200).json(internship.subuser);
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

export const getInternshipByCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
    if (!company) {
      throw new ApiError(409, "Company not found");
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

export const getInternshipByUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(409, "User not found");
    } else {
      const internships = await Internship.find({
        _id: { $in: user.applications },
      });
      res.status(200).json(internships); // return all internships that match the user's applications
    }
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};
