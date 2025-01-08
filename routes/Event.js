import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  createGroup,
  getGroupDetail,
  getUserDetail,
  getGroups,
  inviteToGroup,
  joinGroup,
  leaveGroup,
  removeFromGroup,
  updateGroup,
  deleteGroup,
  rejectGroup,
  postCompanyInterest,
  addPreferredProblemStatement,
  removePreferredProblemStatement,
  confirmProblemStatement,
  // groupSubmission,
  getProblemStatementCounts,
  postProblemStatement,
  getAllProblemStatements,
} from "../controllers/Event.js";

const router = express.Router();

router.post("/createGroup", verifyToken, createGroup); //group creation LEAD
router.patch("/updateGroup", verifyToken, updateGroup); //group update LEAD
router.delete("/deleteGroup", verifyToken, deleteGroup); //group update LEAD

router.post("/inviteToGroup", verifyToken, inviteToGroup); //invite request to someone to group LEAD
router.post("/removeFromGroup", verifyToken, removeFromGroup); //remove someone from group LEAD

router.post("/joinGroup", verifyToken, joinGroup); //join request to group OTHER
router.post("/rejectGroup", verifyToken, rejectGroup); //leaving from a OTHER
router.post("/leaveGroup", verifyToken, leaveGroup); //leaving from a OTHER

// router.post("/groupSubmission", verifyToken, groupSubmission); //group submission LEAD

router.get("/getUserDetail/:id", verifyToken, getUserDetail); //get user details (only name, email, and phone)
router.get("/getGroupDetail/:id", verifyToken, getGroupDetail); //get full group details

router.get("/getGroups/:id", verifyToken, getGroups); //get full group details

router.post("/postCompanyInterest", postCompanyInterest); // Route for Company interest in trekathon

router.post("/addPreferredProblemStatement", addPreferredProblemStatement); // Route for adding preferred problem statement
router.post("/removePreferredProblemStatement", removePreferredProblemStatement); // Route for removing preferred problem statement
router.post("/confirmProblemStatement", confirmProblemStatement); // Route for confirming problem statement

router.get("/getProblemStatementCounts", getProblemStatementCounts); // Route for getting PS counts

router.post("/postProblemStatement", postProblemStatement); // Route for posting new problem statement
router.get("/getAllProblemStatements", getAllProblemStatements); // Route for getting all problem statements

export default router;
