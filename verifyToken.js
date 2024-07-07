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

 export const verifyDownloadToken = (req, res, next) => {
   const token1 = req.cookies.access_token
    const token2 = req.cookies.access_token_company
    if(!token1 || !token2){
        return res.status(401).json({ error: 'Error in access_token' });
    }

    if (token1) {
        jwt.verify(token1, process.env.JWT, (err, user) => {
            if (err){
                
                return res.status(401).json({ error: 'Error in verifying token' });
            }
            else{
                req.user = user
                next()
            }
           })
    }

    if (token2) {        
        jwt.verify(token2, process.env.JWT, (err, company) => {
         if (err){
            return res.status(401).json({ error: 'Error in verifying token' });
         }
         else{
             req.company = company
             next()
         }
        })
    }
 
 }