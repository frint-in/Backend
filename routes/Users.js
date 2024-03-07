import express from "express"
import { update, deleteUser, find, finduserbytoken} from "../controllers/Users.js";
import { verifyToken } from "../verifyToken.js";


const router = express.Router();


//update
router.put("/:id", verifyToken, update)


//delete
router.delete("/:id", verifyToken, deleteUser)


//get
router.get("/find/:id", find)


router.get("/finduserbytoken",verifyToken, finduserbytoken)

//courses
// router.get("/courses/:id", verifyToken, )






export default router;