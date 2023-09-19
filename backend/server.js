const express = require('express');
const dotenv = require('dotenv');
const Chats = require('./models/chatModel');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js');
const {notFound,errorHandler} = require('./middleware/errorMiddleware.js')
const app = express();
dotenv.config()
connectDB()

app.use(express.json()) //to tell the server that it accepts JSON
app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound);
app.use(errorHandler);


const PORT  = process.env.PORT || 5000

const server = app.listen(5000,console.log(`App listening on port ${PORT}`))

const io = require('socket.io')(server,{
    pingTimeout: 60000,
    cors:{
        origin: 'http://localhost:3000',
    },
})

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => {
        console.log(room);
        console.log("typing");
        socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageRecieved) => {
        // console.log(newMessageRecieved)
        Chats.findOne({ _id: newMessageRecieved.chat }).then((result) => {
            // const room = newMessageRecieved.chat._id;
            console.log(result)
            if (!result.users) return console.log("chat.users not defined");
            // console.log("sender id : "+newMessageRecieved.sender._id);
            result.users.forEach((user) => {
                if (user._id !== newMessageRecieved.sender._id){
                    socket.in(user._id).emit("message received", newMessageRecieved);
                } 
            });
        }).catch((err) => {
            console.log("Could not get chat");
            console.log(err);
        });
    });

    // Uncomment this part if needed to handle user disconnect
    // socket.on("disconnect", () => {
    //   console.log("User disconnected");
    //   // Additional logic for handling user disconnect
    // });
});
