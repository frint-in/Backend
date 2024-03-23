import express from "express"
import { addInternship, applicants, deleteInternship, findInternship, getAllIntership, getUsersWithInternship, getUsersWithPendingStatusForInternship, getUsersWithapproved, getUsersWithapprovedStatusForInternship, getUsersWithcompleted, getUsersWithcompletedStatusForInternship, getUsersWithpending, updateInternship, updatestudenttoapproved, updatestudenttocompleted } from "../controllers/Internship.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();

// router.post("/addinternship",verifyToken, addInternship)
router.post("/addinternship",verifyToken,  addInternship)
router.put("/updateinternship/:id",  updateInternship)
router.delete("/:id", verifyToken, deleteInternship)
router.get("/find/:id", findInternship) 
router.put("/addapplicants/:id",verifyToken, applicants)
router.get("/all", getAllIntership)
router.post("/updatetoapprove/:id",verifyToken, updatestudenttoapproved)
router.post("/updatetocomplete/:id", verifyToken, updatestudenttocompleted)
router.get("/getUsersWithPendingStatusForInternship/:id", getUsersWithPendingStatusForInternship)
router.get("/getUsersWithapprovedStatusForInternship/:id", getUsersWithapprovedStatusForInternship)
router.get("/getUsersWithcompletedStatusForInternship/:id", getUsersWithcompletedStatusForInternship )
router.get("/getUsersWithInternship/:id", getUsersWithInternship)


router.get("/getUsersWithapproved", getUsersWithapproved )
router.get("/getUsersWithpending", getUsersWithpending )
router.get("/getUsersWithcompleted", getUsersWithcompleted )






export default router;