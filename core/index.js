exports.init = function init() {
    var middleware = require( './middleware' )
        , express = require( 'express' )
        , app = express()
        , conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );

    var passport = require( 'passport' );
    var auth = require('./passportmiddleware')(passport);
           
    var searchcenter = require( '../routes/centerlocations' );
    var center = require( '../routes/centers' );
    var score = require( '../routes/scoring' );

    var ownuser=require('../routes/ownuser');


    middleware.setup( app, conf );

     //for passport Auth
     app.use(express.session({ secret: 'dip12 3dip@98' }));
     app.use(passport.initialize());
     app.use(passport.session());
  

    //Login routes for FB
    app.get('/login/facebook', passport.authenticate('facebook'));

    app.get('/longin/facebook/callback', 
    passport.authenticate('facebook', { successRedirect: '/loginsuccess',
                                      failureRedirect: '/loginfail' }));

    app.get('/loginfail',function(req,res) {
        res.send('login failed');
        });

        app.get('/loginsuccess',function(req,res) {
        res.send(req.user);
        });

   //Login and signup for Own users
   app.post('/login/own',passport.authenticate('local', { successRedirect: '/loginsuccess', failureRedirect: '/loginfail' }));
   //app.post('/login/own',ownuser.authOwnUser);

   app.post('/signup',ownuser.createUser);

   app.get('/userprofile',ownuser.getUserProfile);
   app.post('/userprofile',ownuser.updateUserProfile);

   //Image upload
   app.get('/user/image',ownuser.getUserImage);
   app.post('/user/image',ownuser.userImage);


   //test login and user creation
   app.get('/test/signup',function(req,res) {
       res.render("../test/signup.jade", {layout: false});
       });

   app.get('/test/login',function(req,res) {
       res.render("../test/login.jade", {layout: false});
       });

   app.get('/test/userprofile',function(req,res) {
   res.render('../test/userprofile.jade', {layout: false});
   });

   app.get('/test/uploadimage',function(req,res) {
       var form = "<!DOCTYPE HTML><html><body>" +
"<form method='post' action='../user/image' enctype='multipart/form-data'>" +
"<input type='file' name='userimage'/>" +
"<input type='submit' /></form>" +
"</body></html>";
   res.writeHead(200, {'Content-Type': 'text/html' });
	res.end(form);
   });

   app.get('/test/showimage/:filename',ownuser.getUserImage);
       
    //External API routes
    //app.get('/locations',searchcenter.findLocationAll);
    app.get( '/v1/centers', center.findCenters );

    app.get( '/v1/centers/:uuid/lanes', center.findCentersAllLanes );
    app.get( '/v1/centers/:uuid/lanes/:lnid', center.findCentersAllLanes );

    app.get( '/v1/scoring', score.getScore );

    //app.get('/locations/:apiid/:country/:area',searchcenter.findByAdministrativeArea);
    //app.get('/locations/:apiid/:centerid',searchcenter.findLaneByCenterID);

    //app.get('/locations/venue',searchcenter.VenueInfo);



    app.listen( conf.server.port );

    console.log( 'bowling server pid %s listening on %d in %s', process.pid, conf.server.port, process.env.NODE_ENV );
};