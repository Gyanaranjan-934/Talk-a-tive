const chatModel = require('./backend/models/chatModel')


module.exports = async(chatid)=>{
    if(!chatid) {
        console.log("enter chat id");
        return null;
    }else{
        var chat = await chatModel.findOne({_id:chatid});
    }
}