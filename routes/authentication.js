import express from "express"
import { logout, resetPass, resetPassword, signin, signinGoogle, signinadmin, signup, signupGoogle} from "../controllers/authentication.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/signupGoogle", signupGoogle)

router.post("/signin", signin)
router.post("/signinGoogle", signinGoogle)
router.post("/signinadmin", signinadmin)

// router.post("/google", )
router.post('/logout', logout)
// router.post('/v1/password/reset', resetPassword)
// router.get('/v1/password/reset/:token', resetPass).put(resetPass)

export default router;