import express from "express"
import { addInternship, applicants, deleteInternship, findInternship, getAllIntership, getUsersWithPendingStatusForInternship, getUsersWithapproved, getUsersWithapprovedStatusForInternship, getUsersWithcompletedStatusForInternship, updateInternship, updatestudenttoapproved, updatestudenttocompleted } from "../controllers/Internship.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();

// router.post("/addinternship",verifyToken, addInternship)
router.post("/addinternship",verifyToken,  addInternship)
router.put("/:id", verifyToken,  updateInternship)
router.delete("/:id", verifyToken, deleteInternship)
router.get("/find/:id", findInternship) 
router.put("/addapplicants/:id",verifyToken, applicants)
router.get("/all", getAllIntership)
router.post("/updatetoapprove/:id",verifyToken, updatestudenttoapproved)
router.post("/updatetocomplete/:id", verifyToken, updatestudenttocompleted)
router.get("/getUsersWithPendingStatusForInternship/:id", getUsersWithPendingStatusForInternship)
router.get("/getUsersWithapprovedStatusForInternship/:id", getUsersWithapprovedStatusForInternship)
router.get("/getUsersWithcompletedStatusForInternship/:id", getUsersWithcompletedStatusForInternship )


router.get("/getUsersWithapproved", getUsersWithapproved )






export default router;