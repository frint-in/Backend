import express from "express"
import { createCalendarEvent, deleteCompany, findAllCompanies, findCompanyById, findInternshipByCompany, getCompany, getUsersWithapprovedByCompany, getUsersWithcompletedByCompany, getUsersWithpendingByCompany, signinCompany, signupCompany, updateCompany } from "../controllers/Company.js";
import { verifyCompanyToken } from "../verifyToken.js";
import { findInternship } from "../controllers/Internship.js";



const router = express.Router();





router.post("/signup", signupCompany)

router.post("/signin", signinCompany)

router.put("/updatecompany", verifyCompanyToken , updateCompany )
router.delete("/deletecompany", verifyCompanyToken , deleteCompany )
router.get('/getAllInternship',verifyCompanyToken, getCompany)
router.get('/allcompanies', findAllCompanies)
router.get('/individualcompany/:id', findCompanyById)
router.get('/findinternshipbycompany/:id', findInternshipByCompany)


router.get("/getUsersWithapproved", verifyCompanyToken, getUsersWithapprovedByCompany);
router.get("/getUsersWithpending", verifyCompanyToken, getUsersWithpendingByCompany);
router.get("/getUsersWithcompleted", verifyCompanyToken, getUsersWithcompletedByCompany);


//create-meeting-calender
router.post('/create-meeting', verifyCompanyToken, createCalendarEvent )



// // router.post('/v1/password/reset', resetPassword)
// // router.get('/v1/password/reset/:token', resetPass).put(resetPass)







export default router;