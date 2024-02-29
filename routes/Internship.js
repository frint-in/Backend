import express from "express"
import { addInternship, applicants, deleteInternship, findInternship, updateInternship } from "../controllers/Internship.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();

router.post("/addinternship",verifyToken, addInternship)
router.put("/:id", verifyToken,  updateInternship)
router.delete("/:id", verifyToken, deleteInternship)
router.get("/find/:id", findInternship) 
router.put("/addapplicants/:id",verifyToken, applicants)





export default router;