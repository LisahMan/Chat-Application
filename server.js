const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http').createServer(app);
const server = http.listen(port,()=>{
    console.log("Server is running in port 3000");
});

app.use(express.static('public'));

const io = require('socket.io')(server);

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://node-shop:projectx-password@cluster0-yk4rh.mongodb.net/test?retryWrites=true&w=majority');

const userController = require('./api/controller/users');
const messageController = require('./api/controller/messages');

let sockets = {};

io.on("connection",(socket)=>{
 console.log("New user joins");

socket.on('signup',async (data)=>{
    try{
      let result = await userController.signup_user(data.name,data.password,socket.id);
      if(result=="Name is taken"){
          socket.emit('nameerr',result);
          return;
          }
      sockets[socket.id] = socket;

      socket.emit('signupsuccessful',"Ok");
      let allUsers = await userController.get_all_users(data.name);
      socket.emit('allusers',allUsers);
    }
    catch(error){
        socket.emit('signuperr',"Some error occured try again");
    }
    
});

socket.on('login',async (data)=>{
    try{ 
     let result = await userController.login_user(data.name,data.password,socket.id);
     
     if(result=="Auth failed"){
         socket.emit('autherr',result);
         return;
     }


     sockets[socket.id] = socket;

      let rooms = await userController.get_rooms(result.name);
      
      if(rooms.rooms.length>0){
          for(let room of rooms.rooms){
              socket.join(room);
          }
      }
      socket.emit('loginsuccessful',"Ok");
      let allUsers = await userController.get_all_users(data.name);
      socket.emit('allusers',allUsers);
    }
    catch(error){
       socket.emit('loginerr',"Some error occured try again");
    }
});


 socket.on('sendmsg',async (data)=>{
    
    let sendtoSocketId = await findUserByName(data.sendto);
    try{
            let room;
     
            let rooms = await userController.get_rooms(data.sendby);
            for(let r of rooms.rooms){
                if(r==(data.sendto+data.sendby+"Room")||r==(data.sendby+data.sendto+"Room")){
                    room = r;
                    break;
                }
            }
     
            if(room===undefined){
             room = await getARoom(data.sendby,data.sendto); 
             socket.join(room);
             
             if(sendtoSocketId){
             sockets[sendtoSocketId].join(room);
             }
            }
            
            let result = await messageController.create_message(data.sendby,data.sendto,data.content);
            io.sockets.in(room).emit('receivemsg',data);
       }
    catch(error){
        socket.emit('msgerr',error.message);
    }
    
 });

 socket.on('getusermsg',async (data)=>{
     try{
        let msgs = await messageController.get_user_messages(data.sendby,data.sendto);
        socket.emit('usermsg',msgs);
     }
     catch(error){
         socket.emit('getusermsgerr',"Some error occured");
     }
     
 });

 socket.on('typing',async (data)=>{
    let rooms = await userController.get_rooms(data.sendby);
    let room;
    for(let r of rooms.rooms){
        if(r==(data.sendto+data.sendby+"Room")||r==(data.sendby+data.sendto+"Room")){
            room = r;
            break;
        }
    }
    
    if(room){
        socket.broadcast.in(room).emit('usertyping',data);
    }
});

socket.on('nottyping',async (data)=>{
    let rooms = await userController.get_rooms(data.sendby);
    let room;
    for(let r of rooms.rooms){
        if(r==(data.sendto+data.sendby+"Room")||r==(data.sendby+data.sendto+"Room")){
            room = r;
            break;
        }
    }
    
    if(room){
        socket.broadcast.in(room).emit('usernottyping',data);
    }
})

});



async function findUserByName(name){
    try{
        let result = await userController.get_user_by_name(name);
        if(result){
            console.log(result.socketId);
            return result.socketId;
        }
    }
    catch(error){
        return false;
    }
    return false;
}

async function getARoom (sendby,sendto) {
    try{
        let room = sendby+sendto+"Room";
        let result = await userController.add_rooms(sendby,sendto,room);
        return room;
    }
    catch(error){
        console.log(error);
    }
}