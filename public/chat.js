const socket = io.connect('http://localhost:3000');

const name = prompt('Enter your name');

if(name!==null && name!=""){
//    socket.emit('joinchat',{'name' : name});
//   socket.emit('signup',{'name':name,'password' : name});
}

let message = document.getElementById('message');
let sendto = document.getElementById('sendto');
let btn = document.getElementById('send');
let signupBtn = document.getElementById('signup');
let loginBtn = document.getElementById('login'); 
let output = document.getElementById('output');
let feedback = document.getElementById('feedback');
let getusermsgbtn = document.getElementById('getusermsg');

signupBtn.addEventListener('click',()=>{
    socket.emit('signup',{'name' : name,'password' : name});
});

loginBtn.addEventListener('click',()=>{
    socket.emit('login',{'name' : name,'password' : name});
});


btn.addEventListener('click',()=>{
  socket.emit('sendmsg',{content : message.value,
                      sendby : name,
                      sendto : sendto.value });
   message.value="";
});

message.addEventListener('keypress',()=>{
    socket.emit('typing',{sendby : name,sendto : sendto.value});
})

getusermsgbtn.addEventListener('click',()=>{
  socket.emit('getusermsg',{'sendby' : name,'sendto' : sendto.value});
});

socket.on('signupsuccessful',(msg)=>{
    alert("SignedUp");
})

socket.on('signuperr',(msg)=>{
    alert(msg);
})

socket.on('msgerr',(err)=>{
    alert(err);
});

socket.on('roommsg',(msg)=>{
    alert(msg);
});

socket.on('nameerr',(msg)=>{
    alert(msg);
});

socket.on('autherr',(msg)=>{
    alert(msg);
})


socket.on('receivemsg',(data)=>{
    console.log("data"+data.content);
 let sendby;
 if(data.sendby===name){
     sendby = "you";
 }else{
     sendby=data.sendby;
 }   
 output.innerHTML+="<p><strong>"+sendby+": <strong>"+data.content+"</p>";
});

socket.on('usermsg',(data)=>{
    if(data.length<1){
        console.log("No messages");
    }
    console.log(data);
});

socket.on('usertyping',(data)=>{
  feedback.innerHTML="<p><em>"+data.sendby + "is" + "typing"+"</em></p>";
});

socket.on('usernottyping',(data)=>{
   feedback.innerHTML="";
});