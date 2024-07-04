import express from "express"
import { deleteUser, find, finduserbytoken, getUserWithPendingStatus, getUserWithApprovedStatus, getUserWithCompletedStatus, updateUser, Seminar, getseminaruser, verifyUserEmail} from "../controllers/Users.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();


//update
router.put("/updateuser",verifyToken,  updateUser)
router.put("/seminar",verifyToken,  Seminar)
router.get("/getseminaruser", getseminaruser)




//delete
router.delete("/:id", verifyToken, deleteUser)


//get
router.get("/find/:id", find)


router.get("/finduserbytoken",verifyToken, finduserbytoken)

router.get("/getUserWithPendingStatusForInternship",verifyToken, getUserWithPendingStatus)
router.get("/getUserWithApprovedStatusForInternship",verifyToken, getUserWithApprovedStatus)
router.get("/getUserWithCompletedStatusForInternship",verifyToken, getUserWithCompletedStatus)

//courses
// router.get("/courses/:id", verifyToken, )

//verifyEmail
router.post("/verifyemail", verifyUserEmail)





export default router;