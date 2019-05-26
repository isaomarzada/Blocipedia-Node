const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const wikiQueries = require("../db/queries.wikis.js");
const User = require("../db/models/").User;
const Wiki = require("../db/models/").Wiki;

module.exports = {

    signUp(req, res, next){
        res.render("users/signup");
    },
    create(req, res, next){

       let newUser = {
           email: req.body.email,
           password: req.body.password,
           name:req.body.name,
           passwordConfirmation: req.body.passwordConfirmation
       };

       userQueries.createUser(newUser, (err, user) => {
           if(err){
               console.log("ERROR:", err);
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
   },
   signInForm(req, res, next){
       res.render("users/sign_in");
   },

   signIn(req, res, next){
       passport.authenticate("local")(req, res, function () {
           if(!req.user){
               req.flash("notice", "Sign in failed. Please try again.")
               res.redirect("/users/sign_in");
           }   else {
               req.flash("notice", "You've successfully signed in.");
               res.redirect("/");
           }
       })
   },

   signOut(req, res, next){
       req.logout();
       req.flash("notice", "You've successfully signed out.");
       res.redirect("/");
   },

	upgradePage(req, res, next){
		res.render("users/upgrade");
	},

 upgrade(req, res, next){
	 const stripe = require("stripe")("pk_test_lzRi0jpBUXKas2lMeTbuhWcc00JQGvqOBp");
	 const token = req.body.stripeToken;
	 const charge = stripe.charges.create({
		 amount: 1500,
		 currency: "cad",
		 description: "Upgrade",
		 source: token,
		 statement_descriptor: 'Blocipedia Upgrade',
		 capture: false,
	 });
	 userQueries.upgrade(req.params.id, (err, user) => {
		 if(err && err.type ==="StripeCardError"){
			 req.flash("notice", "Your payment was unsuccessful");
			 res.redirect("/users/upgrade");
		 } else{
			 req.flash("notice", "Your payment was successful, you are now a Premium Member!");
			 res.redirect(`/`);

		 }
	 });
 },

 downgradePage(req, res, next) {
	 res.render("users/downgrade");
 },

 downgrade(req, res, next){
	 userQueries.downgrade(req.params.id, (err, user) => {
		 if(err){
			 req.flash("notice", "There was an error processing this request");
			 res.redirect("users/downgrade");
		 } else{
			 req.flash("notice", "Your account has been changed back to standard");
			 res.redirect(`/`);
		 }
	 });
 },
 showCollaborations(req, res, next) {
 		userQueries.getUser(req.user.id, (err, result) => {
 			user = result['user'];
 			collaborations = result['collaborations'];
 			if (err || user == null) {
 				res.redirect(404, '/');
 			} else {
 				res.render('users/collaborations', { user, collaborations });
 			}
 		});
 	},
 }
