const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const generateToken = require('../config/generateToken')
const { validationResult, body } = require('express-validator');
const registerValidation = [
    body('email').isEmail()
  ];
  
const registerUser = asyncHandler(async(req,res) => {
    const {name, email, password, pic} = req.body;
    if(!name || !email || !password){
        res.status(400).send({message: 'Invalid credentials'})
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message:"Email should be valid" });
    }
  
    try {
        const userExists = await User.findOne({email})
        if (userExists) {
            res.status(400).send({message: 'User already exists'})
        }
        const user = await User.create({
            name,
            email,
            password,
            pic,
        })
        if(user){
            res.status(201).json({
                _id : user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token : generateToken(user._id),
            })
        }else{
            res.status(500).send({message: 'Internal Server Error'})
        }
    } catch (error) {
        res.status(500).send({message: 'Internal Server Error'})
    }
    
})

const authUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id : user._id,
            name: user.name,
            email: user.email,
            pic:user.pic,
            token: generateToken(user._id),
        })
    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search?{
        $or: [
            {name:{$regex:req.query.search,$options:'i'}},
            {email:{$regex:req.query.search,$options:'i'}},
        ]
    } : {};
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}})
    return res.send(users)
})

module.exports = {registerUser,registerValidation,authUser,allUsers}