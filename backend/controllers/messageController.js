const expressAsyncHandler = require("express-async-handler");
const Message = require('../models/messageModel');
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = expressAsyncHandler(async(req,res) => {
    const { content,chatId } = req.body;
    if(!content || !chatId){
        return res.status(400).send({"message":"Invalid data request"});
    }
    if(content.trim()==0){
        return;
    }
    const newMessage = {
        sender:req.user._id,
        content:content,
        chat:chatId
    }

    try {
        let message = await Message.create(newMessage);
        message = await message.populate("sender","name pic")
        message = await message.populate("sender")
        message = await User.populate(message,{
            path:'chat.users',
            select:'name pic email',
        }) 
        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message,
        })
        res.json(message);
    } catch (error) { 
        res.status(400).send(error);
    }
})

const allMessages = expressAsyncHandler(async(req,res)=>{
    try {
        const messages = await Message.find({chat:req.params.chatId})
        .populate("sender","name pic email")
        .populate("chat")

        res.json(messages)

    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = {
    sendMessage,
    allMessages
}