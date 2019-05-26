require('dotenv').config();
const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
const bcrypt = require("bcryptjs");

module.exports = {

    createUser(newUser, callback){

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);

        return User.create({
            email: newUser.email,
            name:newUser.name,
            password: hashedPassword
        })
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
      },

    getUser(id, callback){
      let result = {};
     User.findById(id)
     .then((user) => {
       if(!user){
         callback(404);
       } else {
        result["user"] = user;
        Collaborator.scope({method: ["collaborationsFor", id]}).all()
        .then((collaborations) => {
          result["collaborations"] = collaborations;
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        })
      }
    })
   },

   upgrade(id, callback){
     return User.findByPk(id)
     .then((user) => {
       if(!user){
         console.log("This is the user" + user);
         return callback("User not found");
       } else{
         user.update({role: "premium"})
         .then((user) => {
           callback(null, user);
         })
         .catch((err) => {
           callback(err);
         })
       }
     });
   },

   downgrade(id, callback){
     return User.findByPk(id)
     .then((user) => {
       if(!user){
         return callback("User not found");
       } else{
         user.update({role:"standard"})
         .then((user) => {
           callback(null, user);
         })
         .catch((err) => {
           callback(err);
         })
       }
     });
   }
}
