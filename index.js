import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
// import userRouter from './routes/user.js'
// import commentRouter from './routes/comments.js'
import CompanyRouter from './routes/Company.js'
import authRouter from './routes/authentication.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import InternshipRouter from './routes/Internship.js'
import userRouter from "./routes/Users.js"




const app = express();
dotenv.config()




const connect = async() => {
    try{
        await mongoose.connect(process.env.mongo_url)
        console.log(`connected to ${mongoose.connection.host}`)
    }catch(err)
    {
        console.log(`${err} in connecting`)
    }
}

var allowedDomains = ['https://student.frint.in', 'https://admin.frint.in'];
app.use(cors({
  origin: function (origin, callback) {
    // bypass the requests with no origin (like curl requests, mobile apps, etc )
    if (!origin) return callback(null, true);
 
    if (allowedDomains.indexOf(origin) === -1) {
      var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/company', CompanyRouter)
app.use('/api/internship', InternshipRouter)
app.use('/api/user', userRouter)






connect()

app.listen(8000, ()=> console.log ('listening on port 8000'))
