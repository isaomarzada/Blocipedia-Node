const userQueries = require("../db/queries.users.js");
const passport = require("passport");

module.exports = {

    signUp(req, res, next){
        res.render("users/signup");
    },
    create(req, res, next){

       let newUser = {
           email: req.body.email,
           password: req.body.password,
           passwordConfirmation: req.body.passwordConfirmation
       };

       userQueries.createUser(newUser, (err, user) => {
           if(err){
               req.flash("error", err);
               res.redirect("/users/signup");
           }   else {

             passport.authenticate("local", (err, user, info) => {
                 if (err || !user) {
                   console.log("ERROR:", err);
                   req.flash(
                     "notice",
                     info ? info.message : "Sign in failed. Please try again."
                   );
                   return res.redirect("/users/sign_in");
                 } else {
                   req.logIn(user, err => {
                     if (err) {
                       console.log("ERROR:", err);
                       req.flash("notice", "Sign in failed. Please try again.");
                       return res.redirect(500, "/users/sign_in");
                     }
                     req.flash("notice", "You've succesfully signed in!");
                     return res.redirect("/");
                   });
                 }
               })(req, res, next);

               const sgMail = require('@sendgrid/mail');
               sgMail.setApiKey(process.env.SENDGRID_API_KEY);
               const msg = {
                   to: newUser.email,
                   from: 'Blocipedia@bloc.com',
                   subject: 'Welcome to Blocipedia!',
                   text: 'Thank you for joining Blocipedia!'
               };
               sgMail.send(msg);
           }
       });
   }
}
