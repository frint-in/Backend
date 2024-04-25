import express from "express"
import { deleteUser, find, finduserbytoken, getUserWithPendingStatus, getUserWithApprovedStatus, getUserWithCompletedStatus, updateUser} from "../controllers/Users.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();


//update
router.put("/updateuser",verifyToken,  updateUser)


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






export default router;