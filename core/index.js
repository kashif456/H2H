exports.init = function init() {
    var http = require('http');
    var middleware = require( './middleware' )
        , express = require( 'express' )
        , app = express()
        , conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );
    var path = require('path');
    var passport = require( 'passport' );
    var auth = require('./passportmiddleware')(passport);
           
    var searchcenter = require( '../routes/centerlocations' );
    var center = require( '../routes/centers' );
    var score = require( '../routes/scoring' );
    var ownuser=require('../routes/ownuser');


    middleware.setup( app, conf );
    //app.use(express.static(path.join(conf.filepath.userimagepath, 'userimages')));
    app.use(express.static(conf.filepath.userimagepath));
    //app.engine('.html', require('jade').renderFile);

     //for passport Auth
     //app.use(express.session({ secret: 'dip12 3dip@98' }));
     app.use(passport.initialize());
     //app.use(passport.session());
  

    //Login routes for FB
    app.get('/login/facebook', passport.authenticate('facebook'));

    app.post('/login/facebook', ownuser.addSocialUser); //as per Son suggestion

    app.get( '/test/facebookpost', function(req,res) {
       res.render("../test/facebook.jade", {layout: false});
       })

    //app.get('/longin/facebook/callback', 
    //passport.authenticate('facebook', {session:false, successRedirect: '/loginsuccess',
    //                                  failureRedirect: '/loginfail' }));

    app.get('/longin/facebook/callback', 
    passport.authenticate('facebook', {session:false,failureRedirect: '/loginfail' }),function(req,res){      
               ownuser.createUserToken(req,res);
       }
       );
    
    app.get('/loginfail',function(req,res) {
        res.json({code:"loginfailed", errno:1000, errdesc:"login failed"});
        });

    app.get('/loginsuccess',function(req,res) {
        res.json(req.user);
        });

   //Login and signup for Own users
   //app.post('/login/own',passport.authenticate('local', { session:false, successRedirect: '/loginsuccess', failureRedirect: '/loginfail' }));
   app.post('/login/own',passport.authenticate('local', { session:false,failureRedirect: '/loginfail' }),function(req,res){      
               ownuser.createUserToken(req,res);               
       }
       );
   

   app.post('/signup',ownuser.createUser);

   app.get('/userprofile',ownuser.authUser, ownuser.getUserProfile);
   app.post('/userprofile',ownuser.authUser,ownuser.updateUserProfile);

   //Image upload
   app.get('/user/image',ownuser.authUser,ownuser.getUserImage);
   app.post('/user/image',ownuser.authUser,ownuser.userImage);

   //User List

   app.get('/v1/userlist',ownuser.authUser,ownuser.getUserList);

   //Friends functinality
   app.get('/v1/friendlist',ownuser.authUser,ownuser.getFriendList);

   app.post('/v1/friendrequest/:frienduserid',ownuser.authUser,ownuser.sendFriendRequest);

   app.post('/v1/acceptfriendrequest/:frienduserid',ownuser.authUser,ownuser.acceptFriendRequest);

   app.post('/v1/ignorefriendrequest/:frienduserid',ownuser.authUser,function(req,res) {
       ownuser.updateFriendRequest(req,res,3);
       });
   app.post('/v1/removefriendrequest/:frienduserid',ownuser.authUser,function(req,res) {
       ownuser.updateFriendRequest(req,res,2);
       });

   app.get('/v1/sentfriendrequest',ownuser.authUser,ownuser.getSentFriendRequest);
   app.get('/v1/receivedfriendrequest',ownuser.authUser,ownuser.getReceivedFriendRequest);


   app.get( '/test/friendrequest', function(req,res) {
       res.render("../test/friendrequest.jade", {layout: false});
       })

   //Notifications
   app.post('/v1/addusernotification',ownuser.authUser,ownuser.addUserNotification);

   app.get('/v1/getusernotification',ownuser.authUser,ownuser.getUserNotification);

   app.post('/v1/ignoreusernotification/:notificationid',ownuser.authUser,ownuser.ignoreUserNotification);

   app.post('/v1/removeusernotification/:notificationid',ownuser.authUser,ownuser.remmoveUserNotification);
   
   app.get( '/test/notificationpost', function(req,res) {
       res.render("../test/notificationtest.jade", {layout: false});
       })   

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


   //Checkins

   app.post( '/v1/checkin',ownuser.authUser, ownuser.addUpdateCheckin );
   app.put( '/v1/checkin', ownuser.authUser,ownuser.addUpdateCheckin );
   app.put( '/v1/checkout/:checkinid', ownuser.authUser,ownuser.UserCheckOut );

   app.get( '/test/checkin', function(req,res) {
       res.render("../test/checkin.jade", {layout: false});
       })
       
   //User Events
   app.get( '/v1/timeline/:userid?',ownuser.authUser, ownuser.GetUserEvents);
   app.get( '/v1/getcomments/:eventid',ownuser.authUser, ownuser.GetEventComments);

   app.post( '/v1/adduserevents',ownuser.authUser, ownuser.addUserEvents );

   app.post( '/v1/addcomment',ownuser.authUser, ownuser.addEventComment );
   app.post( '/v1/addlike',ownuser.authUser, ownuser.addEventLike );

   app.get( '/test/adduserevents', function(req,res) {
       res.render("../test/addevents.jade", {layout: false});
       })

   app.get( '/test/addcomment', function(req,res) {
       res.render("../test/addcomment.jade", {layout: false});
       })

   app.get( '/test/addlike', function(req,res) {
       res.render("../test/addlike.jade", {layout: false});
       })
   


    //External API routes
    //app.get('/locations',searchcenter.findLocationAll);
    app.get( '/v1/centers', center.findCenters );

    app.get( '/v1/centers/:uuid/lanes', center.findCentersAllLanes );
    app.get( '/v1/centers/:uuid/lanes/:lnid', center.findCentersAllLanes );

    app.get( '/v1/scoring', score.getScore );

    //app.get('/locations/:apiid/:country/:area',searchcenter.findByAdministrativeArea);
    //app.get('/locations/:apiid/:centerid',searchcenter.findLaneByCenterID);

    //app.get('/locations/venue',searchcenter.VenueInfo);

    //Privacy Policy

    app.get('/privacy/privacy.html', function(req,res){
        //res.render('../privacy/privacy.html');
        res.render('../test/privacy.jade', {layout: false});
        });
    
    var port =3000;// process.env.PORT || 3000;

http.createServer(app,function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('bowling server iisnode version is %d node version is %d listening on %d %d in %s', process.env.IISNODE_VERSION,process.version, process.env.PORT,conf.server.port, process.env.NODE_ENV   );
}).listen(port); 

    
  //app.listen( process.env.PORT);

    console.log( 'bowling server pid %s listening on %d %d in %s', process.pid, process.env.PORT,conf.server.port, process.env.NODE_ENV );
};