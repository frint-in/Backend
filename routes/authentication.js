import express from "express"
import { createCalenderEvent, getOauthToken, logout,  resetPass, resetPassword, signin, signinGoogle, signinadmin, signup, signupGoogle} from "../controllers/authentication.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/signupGoogle", signupGoogle)

router.post("/signin", signin)
router.post("/signinGoogle", signinGoogle)
router.post("/signinadmin", signinadmin)

router.post('/logout', logout)
//google
router.post("/google-create-token", getOauthToken  )


router.post("/create-event", createCalenderEvent  )

// router.post('/v1/password/reset', resetPassword)
// router.get('/v1/password/reset/:token', resetPass).put(resetPass)


// router.post('/webhook/sms-status', (req, res) => {
//     const notification = req.body;
  
//     // Log the notification for debugging
//     console.log('SMS Delivery Notification:', notification);
  
//     // Process the notification
//     notification.detailed.forEach(detail => {
//       console.log(`To: ${detail.to}`);
//       console.log(`Datetime: ${detail.datetime}`);
//       console.log(`Status: ${detail.status}`);
  
//       if (detail.status === 'failed') {
//         console.log(`Error Code: ${detail.error_code}`);
//         console.log(`Error Description: ${detail.error_des}`);
//       }
//     });
  
//     // Respond to EnableX
//     res.status(200).send('Received');
//   });
  
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });

export default router;