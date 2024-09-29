import express from "express";
import {
  signupAdmin,
  signinAdmin,
  updateAdmin,
  getInternship,
  getInternshipByCompany,
  getInternshipByUser,
  getUserByInternship,
  getCompany,
  getUser,
  // getUsersWithpending,
  // getUsersWithapproved,
  // getUsersWithcompleted,
} from "../controllers/Admin.js";
import { VerifyAdminToken } from "../verifyToken.js";

const router = express.Router();

router.post("/signupAdmin", signupAdmin);
router.post("/signinAdmin", signinAdmin);
router.put("/updateAdmin", VerifyAdminToken, updateAdmin);

router.get("/getAllInternships", VerifyAdminToken, getInternship);
router.get("/getUserByInternship/:id", VerifyAdminToken, getUserByInternship);

router.get("/getAllCompanies", VerifyAdminToken, getCompany);
router.get("/getInternshipByCompany/:id", VerifyAdminToken, getInternshipByCompany);

router.get("/getAllUsers", VerifyAdminToken, getUser);
router.get("/getInternshipByUser/:id", VerifyAdminToken, getInternshipByUser);

// router.get("/getUsersWithpending", VerifyAdminToken, getUsersWithpending);
// router.get("/getUsersWithapproved", VerifyAdminToken, getUsersWithapproved);
// router.get("/getUsersWithcompleted", VerifyAdminToken, getUsersWithcompleted);

export default router;
