import jwt from "jsonwebtoken";



export const verifyToken = (req, res, next) => {
   const token = req.cookies.access_token
   if(!token){
    return res.status(401).json({ error: 'Error in access_token' });
}

   jwt.verify(token, process.env.JWT, (err, user) => {
    if (err){
        return res.status(401).json({ error: 'Error in verifying token' });
    }
    else{
        req.user = user
        next()
    }
   })
}

export const verifyCompanyToken = (req, res, next) => {
    const token = req.cookies.access_token_company
    if(!token){
        return res.status(401).json({ error: 'Error in access_token' });
    }
 
    jwt.verify(token, process.env.JWT, (err, company) => {
     if (err){
        return res.status(401).json({ error: 'Error in verifying token' });
     }
     else{
         req.company = company
         next()
     }
    })
 }