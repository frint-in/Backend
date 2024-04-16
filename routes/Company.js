import express from "express"
import { deleteCompany, findAllCompanies, findCompanyById, findInternshipByCompany, signinCompany, signupCompany, updateCompany } from "../controllers/Company.js";
import { verifyCompanyToken } from "../verifyToken.js";
import { findInternship } from "../controllers/Internship.js";


const router = express.Router();





router.post("/signup", signupCompany)
router.post("/signin", signinCompany)
router.put("/updatecompany", verifyCompanyToken , updateCompany )
router.delete("/deletecompany", verifyCompanyToken , deleteCompany )

router.get('/allcompanies', findAllCompanies)
router.get('/individualcompany/:id', findCompanyById)
router.get('/findinternshipbycompany/:id', findInternshipByCompany)


// // router.post('/v1/password/reset', resetPassword)
// // router.get('/v1/password/reset/:token', resetPass).put(resetPass)







export default router;