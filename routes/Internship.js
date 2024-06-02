import express from "express"
import { addInternship, applicants, deleteInternship, findInternship, getAllIntership, getUsersWithInternship, getUsersWithPendingStatusForInternship, getUsersWithapproved, getUsersWithapprovedStatusForInternship, getUsersWithcompleted, getUsersWithcompletedStatusForInternship, getUsersWithpending, updateInternship, updatestudenttoapproved, updatestudenttocompleted } from "../controllers/Internship.js";
import { verifyCompanyToken, verifyToken } from "../verifyToken.js";


const router = express.Router();

// router.post("/addinternship",verifyToken, addInternship)
router.post("/addinternship",verifyCompanyToken,  addInternship)


//update and delete internship doesn't use authorization, need to fix
router.put("/updateinternship/:id",  updateInternship)
router.delete("/deleteinternship/:id", deleteInternship)
router.get("/find/:id", findInternship) 
router.put("/addapplicants/:id",verifyToken, applicants)
router.get("/all", getAllIntership)


//admin actions to approve or hire an intern, skeptical about verifyToken function
// router.put("/updatetoapprove/:id",verifyToken, updatestudenttoapproved)
// router.put("/updatetocomplete/:id", verifyToken, updatestudenttocompleted)
router.put("/updatetoapprove/:id",verifyCompanyToken, updatestudenttoapproved)
router.put("/updatetocomplete/:id", verifyCompanyToken, updatestudenttocompleted)

router.get("/getUsersWithPendingStatusForInternship/:id", getUsersWithPendingStatusForInternship)
router.get("/getUsersWithapprovedStatusForInternship/:id", getUsersWithapprovedStatusForInternship)
router.get("/getUsersWithcompletedStatusForInternship/:id", getUsersWithcompletedStatusForInternship )
router.get("/getUsersWithInternship/:id", getUsersWithInternship)


router.get("/getUsersWithapproved", getUsersWithapproved )
router.get("/getUsersWithpending", getUsersWithpending )
router.get("/getUsersWithcompleted", getUsersWithcompleted )






export default router;