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

app.use(cors({
  origin: ['https://admin.frint.in', 'https://student.frint.in','https://frint.in', 'http://localhost:5173'],
  credentials: true
}));
app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/company', CompanyRouter)
app.use('/api/internship', InternshipRouter)
app.use('/api/user', userRouter)






connect()

app.listen(8000, ()=> console.log ('listening on port 8000'))
