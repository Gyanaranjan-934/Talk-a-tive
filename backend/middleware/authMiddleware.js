const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async(req, res, next)=>{
    let token;
    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
            token = req.headers.authorization.split(" ")[1];

            // decoding the token
            const decodeToken = jwt.verify(token,process.env.JWT_SECRET);

            req.user = await User.findById(decodeToken.id).select('-password');

            next();
        }catch(e){
            res.status(401).send({message:e.message});
        }
    }
    if(!token){
        res.status(401).send({message:"Unauthorized access"})
    }
})

module.exports = {protect}