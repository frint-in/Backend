import express from "express"
import { getStatusAfterPayment, payAndGetRedirectUrl } from "../controllers/Phonepe.js";


const router = express.Router();


router.post("/payment", payAndGetRedirectUrl)
router.post("/status", getStatusAfterPayment)










export default router;