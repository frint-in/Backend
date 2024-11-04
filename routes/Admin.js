import express from "express";
import {
  signupAdmin,
  signinAdmin,
  getInternship,
  getInternshipByCompany,
  getInternshipByUser,
  getUserByInternship,
  getCompany,
  getUser,
  getLength,
  getInternshipById,
  getCompanyById,
  getUserById,
} from "../controllers/Admin.js";
import { VerifyAdminToken } from "../verifyToken.js";

const router = express.Router();

router.post("/signupAdmin", signupAdmin);
router.post("/signinAdmin", signinAdmin);

router.get("/getAllInternships", VerifyAdminToken, getInternship);
router.get("/getInternshipById/:id", VerifyAdminToken, getInternshipById);
router.get("/getUserByInternship/:id", VerifyAdminToken, getUserByInternship);

router.get("/getAllCompanies", VerifyAdminToken, getCompany);
router.get("/getCompanyById/:id", VerifyAdminToken, getCompanyById);
router.get("/getInternshipByCompany/:id", VerifyAdminToken, getInternshipByCompany);

router.get("/getAllUsers", VerifyAdminToken, getUser);
router.get("/getUserById/:id", VerifyAdminToken, getUserById);
router.get("/getInternshipByUser/:id", VerifyAdminToken, getInternshipByUser);

router.get("/getLengths", VerifyAdminToken, getLength);


export default router;
