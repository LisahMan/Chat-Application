const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.signup_user = (name,password,socketId)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({name : name})
        .exec()
        .then(doc=>{
            if(doc){
                resolve("Name is taken");
            }
            
            bcrypt.hash(password,10,(err,hash)=>{
                if(err){
                 reject(err);
                }
   
                const user = new User({
                    _id : new mongoose.Types.ObjectId,
                    name : name,
                    password : hash,
                    socketId : socketId
                });
   
                user.save()
                    .then(
                        doc=>{
                            let result = {
                                message : "User is created",
                                _id : doc._id,
                                name : doc.name
                            };
                            resolve(result);
                        }
                    )
                    .catch(error=>{
                        reject(error);
                    })
            })
   
        })
        .catch(error=>{
           reject(error);
        })
    });
}

exports.login_user = (name,password,socketId)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({name:name})
            .exec()
            .then(user=>{
                if(!user){
                    resolve("Auth failed");
                }

                bcrypt.compare(password,user.password,(err,same)=>{
                    if(err){
                        reject(err);
                    }

                    if(same){
                        User.findOneAndUpdate({name:name},{$set : {socketId : socketId}})
                        .then(res=>{
                            let result = {
                                message : "Auth succesful",
                                _id  : user._id,
                                name : user.name
                            }
    
                            resolve(result);
                           }
                        )
                        .catch(error=>{
                            reject(error);
                        })
                        
                    }
                    else{
                        resolve("Auth failed");
                    }
                })
            })
            .catch(error=>{
                reject(error);
            })
    })
}

exports.get_all_users = (name)=>{
    return new Promise((resolve,reject)=>{
     User.find({name : {$ne : name}})
         .select('name')
         .exec()
         .then(docs=>{
             resolve(docs);
         })
         .catch(error=>{
             reject(error);
         })
    });
}

exports.get_user_by_name = (name)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({name : name})
            .select('_id name socketId')
            .then(doc=>{
                resolve(doc);
            })
            .catch(error=>{
                reject(error);
            })
    })
}

exports.add_rooms = (sendby,sendto,room)=>{
    return new Promise((resolve,reject)=>{
        const roomObj = {rooms : room};
       User.updateMany({$or : [{name : sendby},{name : sendto}]},{$push : roomObj})
           .exec()
           .then(result=>{
               resolve("Ok");
           })
           .catch(error=>{
               reject(error);
           })
    })
}

exports.get_rooms = (name)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({name : name})
            .select('rooms')
            .exec()
            .then(doc=>{
                resolve(doc);
            })
            .catch(error=>{
                reject(error);
            })
    })
}