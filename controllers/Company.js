import mongoose from 'mongoose'
import Company from '../models/Company.js'
import bcrypt from "bcrypt"
import jwt  from "jsonwebtoken";
import { resolveContent } from "nodemailer/lib/shared/index.js";
import sendEmail from "../sendEmail.js";
import crypto from "crypto"
import Internship from "../models/Internship.js";




export const signupCompany = async(req, res) =>{
    try{
        const password = req.body.password.toString()
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newCompany = new Company({...req.body, password: hash})


        await newCompany.save()
        res.status(200).send("User created")
    }catch (err) {
        console.log(err)
        res.status(500).send("An error occurred");
    }
}



//signin

export const signinCompany = async(req, res) =>{
    try{
        const company = await Company.findOne({email:req.body.email})
        if(!company){
            console.log('incorrect Email')
        }
        const isCorrect =await bcrypt.compare(req.body.password.toString(), user.password)
        if(!isCorrect){
            console.log('incorrect password')
        }
        



        else{
        const {password, ...others} = company._doc
        const token = jwt.sign({id:company._id}, process.env.JWT)
        res.cookie("access_token", token, {
            httpOnly:true
        }).status(200).json({others, token})
        }
    }catch (err) {
        console.log(err)
        res.status(500).send("An error occurred");
    }
}








export const updateCompany = async(req, res)=>{
      
    try{
        const company = await Company.findById(req.company.id)
        if(!internship){
            console.log('Internship not found')
        }
        if(req.user.id === company.userID){
            const  updatedCompany = await Company.findByIdAndUpdate(req.params.id , {
                $set:req.body,
            }, {
                new:true
            })
            res.status(200).json(updatedCompany)
        }
    }catch(err){
        console.log(err)
    }
}


export const deleteUser = async(req, res) =>{
    if(req.params.id === req.user.id){
        try{
            const deletedUser = await Users.findByIdAndDelete(req.params.id, )
            res.status(200).json("user deleted")
        }catch(err){
            console.log("err")
        }
    
    }else {
        console.log("tokenid != userid")
    }
}


export const find = async(req, res) =>{
        try{
            const user= await findById(req.params.id)
            res.status(200).json(user)
        }catch(err){
            console.log("error in finding user")
        }
    }







