var usermodel = require( '../models/user' );
var conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );

exports.createUser=function createUser(req,res) {

    var usrdata=req.body;

    if(typeof usrdata.email=='undefined' || usrdata.email=='')
        {
            res.send('email cannot be blank', 
		    {'Content-type' : 'text/plain'}, 
                    4001);
            return;
            }
   
    if(typeof usrdata.password=='undefined' || usrdata.password=='')
        {
            res.send('password cannot be blank', 
		    {'Content-type' : 'text/plain'}, 
                    4002);
            return;
            }

    if(typeof usrdata.lastname=='undefined' || usrdata.lastname=='')
        {
            res.send('lastname cannot be blank', 
		    {'Content-type' : 'text/plain'}, 
                    4003);
            return;
            }
    if(typeof usrdata.firstname=='undefined' || usrdata.firstname=='')
            {
                res.send('firstname cannot be blank', 
		        {'Content-type' : 'text/plain'}, 
                        4004);
                return;
                }           
            
            //gender, dob, locationtext, longitude, lattitude, local,mobileno,timezone
            
     //encrypt password will do later
     
       usermodel.createOwnUser('N',usrdata,function(err,user){

           if(err)
               {
                   res.send(err);
                   }
           else
               {
           res.send(user);
           }


           });

    };

exports.authOwnUser=function authOwnUser(req,res) {

     var usrdata=req.body;

    if(typeof usrdata.username=='undefined' || usrdata.username=='')
        {
            res.send('email cannot be blank', 
		    {'Content-type' : 'text/plain'}, 
                    4001);
            return;
            }
   
    if(typeof usrdata.password=='undefined' || usrdata.password=='')
        {
            res.send('password cannot be blank', 
		    {'Content-type' : 'text/plain'}, 
                    4002);
            return;
            }


            usermodel.authenticateUser( 'N', usrdata.username, usrdata.password, function(err,user)
                {
                    if(err)
                        {res.send(err);}
                    else
                        {
                            res.send(user);

                            }
                    }
                );

    };


exports.getUserProfile=function getUserProfile(req,res) {

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.send('user not logged in');
            return;
        }

    var usrid='';

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=req.user.id;
       }
    else
        {
            usrid=req.userid;
            }

    

            usermodel.getUserProfileByID(usrid,function(err,usrProfile){
                if(err){
                    res.send(err);
                    }
                else {
                    res.send(usrProfile);
                    
                    }
                })
      

    };

exports.updateUserProfile=function updateUserProfile(req,res) {

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.send('user not logged in');
            return;
        }

    var usrid='';

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=req.user.id;
       }
    else
        {
            usrid=req.userid;
            }


    var data=req.body;

     usermodel.updateUserProfile(usrid,data,function(err,usrProfile){
                if(err){
                    res.send(err);
                    }
                else {
                    res.send(usrProfile);
                    }
                })


    };

var fs = require('fs');
exports.userImage=function userImage(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.send('user not logged in');
            return;
        }

    var usrid='';

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=req.user.id;
       }
    else
        {
            usrid=req.userid;
            }


//    var data=req.body;
    
    var tmp_path = req.files.userimage.path;
    
    var target_path =conf.filepath.userimagepath+'/'+usrid+'_'+req.files.userimage.name; //'./userimages/' + req.files.userimage.name;
    
    fs.rename(tmp_path, target_path, function(err) {
        if (err) res.send(err);
  
              // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
    
              usermodel.updateUserImage(usrid,target_path,function(err,usrProfile){
                if(err){
                    res.send(err);
                    }
                else {
                    res.send('File uploaded to: ' + target_path + ' - ' + req.files.userimage.size + ' bytes');
                    }
                })
    
            
        });
    });


    };

exports.getUserImage=function getUserImage(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.send('user not logged in');
            return;
        }

    var usrid='';

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=req.user.id;
       }
    else
        {
            usrid=req.userid;
            }

    //var file = req.params.filename;
    //var target_path =conf.filepath.userimagepath; //+'/'+file;// './userimages/' + file;

    usermodel.getUserImageByID(usrid,function(err,imagePath){
                if(err){
                    res.send(err);
                    }
                else {
                    var target_path=imagePath;

                    var img = fs.readFileSync( target_path );
	res.writeHead(200, {'Content-Type': 'image/jpg' });
	res.end(img, 'binary');
                    
                    }
                })

    
	
    };