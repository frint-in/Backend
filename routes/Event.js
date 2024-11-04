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
  // groupSubmission,
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

export default router;
