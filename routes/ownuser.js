var usermodel = require( '../models/user' );
var conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );
var url = require('url');
var jwt = require('jwt-simple');
var passport = require( 'passport' );
var userEventmodel=require( '../models/userevents' );

exports.createUser=function createUser(req,res) {

    var usrdata=req.body;

    if(typeof usrdata.email=='undefined' || usrdata.email=='')
        {
            res.json({code:"emailrequired", errno:2001, errdesc:"email cannot be blank"});
            return;
            }
   
    if(typeof usrdata.password=='undefined' || usrdata.password=='')
        {
            res.json({code:"pwdrequired", errno:2002, errdesc:"password cannot be blank"});
            return;
            }

    if(typeof usrdata.lastname=='undefined' || usrdata.lastname=='')
        {
            res.json({code:"lastnamerequired", errno:2003, errdesc:"lastname cannot be blank"});           
            return;
            }
    if(typeof usrdata.firstname=='undefined' || usrdata.firstname=='')
            {
                res.json({code:"firstnamerequired", errno:2004, errdesc:"firstname cannot be blank"});                
                return;
                }           
            
            //gender, dob, locationtext, longitude, lattitude, local,mobileno,timezone
            
     //encrypt password will do later
     
       usermodel.createOwnUser('N',usrdata,function(err,user){

           if(err)
               {
                   //res.send(err);
                   res.json({code:"adduser", errno:2005, errdesc:"error while adding user"});                
                }
           else
               {

                res.json(user);
                userEventmodel.addUserEvents(101,user.id, 0, user.displayname);
           }
           });

    };

exports.addSocialUser=function addSocialUser (req,res){

    var usrdata=req.body;

    if(typeof usrdata.provider_id=='undefined' || usrdata.provider_id=='')
        {
            res.json({code:"provider_idReq", errno:2001, errdesc:"provider_id cannot be blank"});
            return;
            } 
            
    if(typeof usrdata.email=='undefined' || usrdata.email=='')
        {
            res.json({code:"emailReq", errno:2002, errdesc:"email cannot be blank"});
            return;
            }   
     
       usermodel.addSocialUsers('F',usrdata,function(err,user){

           if(err)
               {
                   //res.send(err);
                   res.json({code:"adduserSocial", errno:2005, errdesc:"error while adding user"});                
                }
           else
               {
                res.json(user);
                //userEventmodel.addUserEvents(101,user.id, 0, user.displayname);
           }
           });

    };

exports.authUser=function authUser(req,res,next) {

    var parsed_url = url.parse(req.url, true);
    
    var tokenStr = (req.body && req.body.access_token) || parsed_url.query.access_token || req.headers["x-access-token"] || req.headers["access_token"];

     if (tokenStr) {

		try {

            var userType=tokenStr.substring(0,1);
           // if(userType=="N")
           //     {            
                var token=tokenStr.substring(1);
			    var decoded = jwt.decode(token, conf.application.jwtSecrete)

			//if (decoded.exp <= Date.now()) {
			//	res.json({code:"tokenExp", errno:2020, errdesc:"Token expired re-login"});
			//}

			usermodel.getUserByID(decoded.iss, function(err, user){
				if (!err) {					
					req.user = user									
					return next();
				}
			})                                                        
         //}
         //else
         //    {
                 
         //        usermodel.getUserByToken(tokenStr,function(err, user){
		 //   	        if (!err) {					
		 //   		        req.user = user									
		 //   		        return next();
		 //   	        }
		 //           })  

         //        }         

		} catch (err) {			
                res.json({code:"tokenErr", errno:2022, errdesc:"Error while token processing..."});
			//return next()
		}

	} else {

	    res.json({code:"tokenErr", errno:2021, errdesc:"Token Not exist. re-login"});

	}            

    };

exports.createUserToken=function (req,res){

     if(req.user)
           {
               //if(req.user.usertype=="F")
               //    {
               //        res.json(req.user);
               //        }
               //else
               //    {
               usermodel.createUserToken(req.user.usertype, req.user,function(err,token)
                   {
                       if(err){
                           res.json(err)} 
                       else {
                                                   
                            req.user.token=token;
                           res.json(req.user);
                          // res.json({token:token})

                          };

                       });
               //     }
                                      
               } else {
            res.json({code:"loginfailed", errno:1000, errdesc:"login failed"});
        }

    };

exports.getUserProfile=function getUserProfile(req,res) {

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

    var usrid='';

    var usrData=req.user; //JSON.parse(req.user);

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=usrData.id;
       }
    else
        {
            usrid=req.userid;
            }

    

            usermodel.getUserProfileByID(usrid,function(err,usrProfile){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(usrProfile);
                    
                    }
                })
      

    };

exports.updateUserProfile=function updateUserProfile(req,res) {

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});
            return;
        }

    var usrid='';

    var usrData=req.user; //JSON.parse(req.user);
    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=usrData.id;
       }
    else
        {
            usrid=req.userid;
            }

    var data=req.body;

     usermodel.updateUserProfile(usrid,data,function(err,usrProfile){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(usrProfile);
                    }
                })


    };

exports.getUserList=function getUserList(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }
        var currentpage = 0;
        var count=0;
        if(req.query.offset >0)
            currentpage=req.query.offset;
        if(req.query.count>0)
            count=req.query.count;

        var usernametosearch='';
        if ( typeof req.query.searchname != 'undefined' )
        { 
            usernametosearch = req.query.searchname.trim(); 
         }

        usermodel.getUserList(usernametosearch,currentpage,count,function(err,usrLst){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(usrLst);                    
                    }
                })


    };

exports.getFriendList=function getFriendList(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var usrID=req.user.id;        

        var currentpage = 0;
        var count=0;
        if(req.query.offset >0)
            currentpage=req.query.offset;
        if(req.query.count>0)
            count=req.query.count;

        usermodel.getFriendList(usrID,currentpage,count,function(err,usrLst){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(usrLst);                    
                    }
                })


    };

exports.sendFriendRequest=function sendFriendRequest(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var frienduserid="0";

        if(req.params.frienduserid >0)
            {
                frienduserid=req.params.frienduserid;
                var usrID=req.user.id;     

                usermodel.sendFriendRequest(usrID, frienduserid, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata);
                    //userEventmodel.addUserEvents(121,usrid, frienduserid, '');              
                    }
                })

             }
        else
            {
                res.json({code:"sendfrndreq", errno:7021, errdesc:"friend user id not passed"});            
                return;

              }
               
    };

exports.acceptFriendRequest=function acceptFriendRequest(req, res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var frienduserid="0";

        if(req.params.frienduserid >0)
            {
                frienduserid=req.params.frienduserid;
                var usrID=req.user.id;     

                usermodel.acceptFriendRequest(usrID, frienduserid, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata);
                    //userEventmodel.addUserEvents(123,usrid, frienduserid, '');              
                    }
                })

             }
        else
            {
                res.json({code:"acceptfrndreq", errno:7021, errdesc:"friend user id not passed"});            
                return;

              }

    };

exports.updateFriendRequest=function updateFriendRequest(req, res,frstatus){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var frienduserid="0";

        if(req.params.frienduserid >0)
            {
                frienduserid=req.params.frienduserid;
                var usrID=req.user.id;     

                usermodel.updateFriendRequest(usrID, frienduserid,frstatus, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata);
                    //userEventmodel.addUserEvents(123,usrid, frienduserid, '');              
                    }
                })

             }
        else
            {
                res.json({code:"acceptfrndreq", errno:7021, errdesc:"friend user id not passed"});            
                return;

              }

    };

exports.getSentFriendRequest= function getSentFriendRequest(req,res){
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

         var usrID=req.user.id;     

                usermodel.getFriendRequest(usrID, 120, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata); 
                    }
                })

    };

exports.getReceivedFriendRequest= function getReceivedFriendRequest(req,res){
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

         var usrID=req.user.id;     

                usermodel.getFriendRequest(usrID, 121, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata); 
                    }
                })

    };

exports.addUserNotification=function addUserNotification(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var foruserid=req.body.notificationtforuserid;
        var typeid=req.body.notificationtypeid;
        var textmsg=req.body.notificationtext;
        
        if(textmsg=='undefined'||textmsg.trim()=='')
            {
                res.json({code:"usrNotification", errno:8006, errdesc:"notification text is required"});            
                return;

             }
        if(typeid=='undefined'||typeid=='' )
            {
                typeid=0;
                }

        if(foruserid >0)
            {                
                var usrID=req.user.id;     

                usermodel.addUserNotification(usrID, foruserid,typeid,textmsg, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata); 
                    }
                })

             }
        else
            {
                res.json({code:"usrNotification", errno:8005, errdesc:"notification for user id is required"});            
                return;
              }


    };

exports.getUserNotification= function getUserNotification(req,res){
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

         var usrID=req.user.id;     

                usermodel.getUserNotification(usrID,  function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata); 
                    }
                })

    };

exports.ignoreUserNotification= function ignoreUserNotification(req,res){
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

         var notificationid="0";

        if(req.params.notificationid >0)
            {
                notificationid=req.params.notificationid;
                var usrID=req.user.id;     

                usermodel.ignoreUserNotification(notificationid, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata);                                 
                    }
                })

             }
        else
            {
                res.json({code:"errNotification", errno:8004, errdesc:"notification id is required"});            
                return;

              }

    };

exports.remmoveUserNotification= function remmoveUserNotification(req,res){
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

         var notificationid="0";

        if(req.params.notificationid >0)
            {
                notificationid=req.params.notificationid;
                var usrID=req.user.id;     

                usermodel.remmoveUserNotification(notificationid, function(err,chkdata){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json(chkdata);                                 
                    }
                })
             }
        else
            {
                res.json({code:"errNotification", errno:8005, errdesc:"notification id is required"});            
                return;

              }

    };

var fs = require('fs');
exports.userImage=function userImage(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});
            return;
        }

    var usrid='';

    var usrData=req.user; //JSON.parse(req.user);
    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=usrData.id;
       }
    else
        {
            usrid=req.userid;
            }


//    var data=req.body;
    
    var tmp_path = req.files.userimage.path;
    
    var target_path =conf.filepath.userimagepath+'/'+usrid+'_'+req.files.userimage.name; //'./userimages/' + req.files.userimage.name;
    
    fs.rename(tmp_path, target_path, function(err) {
        if (err) 
            {
                console.error( err );
                res.json({code:"ErrImgUpld", errno:4010, errdesc:"error while uploading image"});
                return;   
             }
  
              // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) {
                console.error( err );
                res.json({code:"ErrImgUpld", errno:4020, errdesc:"error while uploading image"});
                return;
               }
    
              usermodel.updateUserImage(usrid,target_path,function(err,usrProfile){
                if(err){
                    res.json(err);
                    }
                else {
                    res.json({message:'User image set successfully'});
                    //'File uploaded to: ' + target_path + ' - ' + req.files.userimage.size + ' bytes's
                    }
                })
    
            
        });
    });


    };

exports.getUserImage=function getUserImage(req,res){

    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});
            return;
        }

    var usrid='';

    var usrData=req.user; //JSON.parse(req.user);
    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=usrData.id;
       }
    else
        {
            usrid=req.userid;
         }

    //var file = req.params.filename;
    //var target_path =conf.filepath.userimagepath; //+'/'+file;// './userimages/' + file;

    usermodel.getUserImageByID(usrid,function(err,imagePath){
                if(err){
                    res.json(err);
                    }
                else {
                    var target_path=imagePath;
                    if (imagePath==null || imagePath=='' )
                        {
                            res.end(null, 'binary'); 
                         }
                    else
                        {
                            var img = fs.readFileSync( target_path );
	                        res.writeHead(200, {'Content-Type': 'image/jpg' });
	                        res.end(img, 'binary');                       
                        } 
                    }
                })    
	
    };

exports.addUpdateCheckin =function addUpdateCheckin(req, res){    
   
    if((req.user ==null || typeof req.user =='undefined') && (req.userid ==null || typeof req.userid=='undefined'))
        {
            res.json({code:"login", errno:1030, errdesc:"User not logged in"});            
            return;
        }

        var reqData=req.body;
        var isputreq=0;
        if(typeof reqData.checkinid=='undefined' || reqData.checkinid==0 || reqData.checkinid=='0')
            {
                

                if(typeof reqData.centreID=='undefined' || reqData.centreID==0 || reqData.centreID=='0')
                    {
                        res.json({code:'checkin', errno:3001, errdesc:'centre id is required'});            
                        return;

                        } 
            }
            else
                {
                    isputreq=1;
                    }

    var usrid='';

    var usrData=req.user;    

    if(req.user !=null && typeof req.user !='undefined')
        {
            usrid=usrData.id;
       }
    else
        {
            usrid=req.userid;
            }

    
    usermodel.addupdateCheckin(usrid,reqData, function(err,chkdata){
        if(err){
            res.json(err);
            }
        else {
            res.json(chkdata);
            if (isputreq==0)
                userEventmodel.addUserEvents(105,usrid, 0, chkdata.centreName);
                    
            }
        })
    

    /*call post when chekcin to add


{
checkinid:0,       --System genereted checkin id, 0 when doing checkin (post) after checkin done, api will send this date
userid:121,        --System user id, optional 
CenterTypeID:1002, --From Which external api For future, for now pass 1002 only
CentreID:'g213',   -- user selected center id  Required 
CentreName:'centrename'
  --Center Name optional
LaneNo:1211,
             ---user selected Lane No optional  
GameID: 11231,           --user selected game optional 
  
GameNo: 1,
               ---user selected game no optional
PlayerNo: 1,
             ---user selected palyer no optional 
PlayerName: 'mark',      --user selected  optional 
CheckInDate: 'utc date' , -- optional,  after checkin done, api will send this date
}

call put after checkin done to update */

    };

exports.UserCheckOut=function UserCheckOut(req,res){

    if ( typeof req.query.checkinid == 'undefined' || req.query.checkinid=='' )

      var checkinid= req.query.checkinid;

      var usrid=req.user.id;

      usermodel.UserCheckOut(checkinid, function(err,chkdata){
        if(err){
            res.json(err);
            }
        else {
            res.json(chkdata);
            userEventmodel.addUserEvents(106,usrid, 0, chkdata.centreName); 
            }
        })

    };


exports.addUserEvents=function addUserEvents(req,res ){
    
     //eventid, eventforuserid, eventfromuserid, eventtext
   
     var eventData=req.body;
     
     var eventforuserid=req.user.id;
     var eventid='-1';
     var eventfromuserid='0';
     var eventtext=''


     if(!(typeof eventData.eventid=='undefined' || eventData.eventid==''))
        {
            eventid=eventData.eventid;
        };

        if(!(typeof eventData.eventtext=='undefined' || eventData.eventtext==''))
        {
            eventtext=eventData.eventtext.trim();
        };

        if(eventid=='-1' || eventtext=='')
            {
                res.json({code:"blankEvent", errno:7006, errdesc:"No Event ID and/or  eventtext is blank. either one is required"});
            return;

                }
     
    userEventmodel.addUserEvents(eventid, eventforuserid, eventfromuserid, eventtext,function(data){
          res.json(data);
        });

  };

exports.GetUserEvents=function GetUserEvents(req,res){
    
    var userid=req.user.id;
    var frienduserid=0;
    if (  req.params.userid>0)
        {
            frienduserid=req.params.userid;
         }

    var currentpage = 0;
    var count=0;
        if(req.query.offset >0)
            currentpage=req.query.offset;
        if(req.query.count>0)
            count=req.query.count;
        

    userEventmodel.GetUserEvents(userid,frienduserid,currentpage,count,function(err,data){
        if(err){
            res.json(err);
            }
        else {

            var strTmp='';//JSON.stringify(data);


            for( var indx in data)
                {
                    //var t = data[indx];
                    /*strTmp=data[indx].Events;
                    var tmpJsn=JSON.parse(strTmp);
                    data[indx].Events=tmpJsn;*/
                    strTmp=data[indx].Comments;
                    var tmpJsn=JSON.parse(strTmp);
                    data[indx].Comments=tmpJsn;

                    strTmp=data[indx].likedby;
                    var tmpJsn=JSON.parse(strTmp);
                    data[indx].likedby=tmpJsn;

                    
                }
           //// var tmp='[{"id":"11", "eventid":"0", "text":"Test Event","date":"2014-07-25 08:51:00", "Comments":[{"id":"2", "text":"Test Comment 2", "postuserid":"11", "postusername":"e e", "postdate":"2014-07-25 09:05:45"},{"id":"1", "text":"Test Comment", "postuserid":"11", "postusername":"e e", "postdate":"2014-07-25 08:54:21"},{"id":"3", "text":"Test Comment 3", "postuserid":"11", "postusername":"e e", "postdate":"2014-07-25 09:05:51"}]},{"id":"10", "eventid":"105", "text":"Checked in at Location blng us","date":"2014-07-24 08:55:33", "Comments":[]},{"id":"9", "eventid":"101", "text":"e e Registered with iBowl App","date":"2014-07-24 08:38:03", "Comments":[]}]';
           //// var jt=JSON.parse(tmp);
           ////// strTmp=strTmp.replace(/"/g, '\'');//.replace(/\"/g,'\\"'); //.replace("\"","")            
           //// //var strtmp1=JSON.parse(strTmp);
            res.json(data);            
            }

        });

    };
exports.GetEventComments=function GetEventComments(req,res){
    
    var userid=req.user.id;
    var eventid=0;
    if (  req.params.eventid>0)
        {
            eventid=req.params.eventid;
         }

    var currentpage = 0;
    var count=0;
        if(req.query.offset >0)
            currentpage=req.query.offset;
        if(req.query.count>0)
            count=req.query.count;
        

    userEventmodel.GetEventComments(userid,eventid,currentpage,count,function(err,data){
        if(err){
            res.json(err);
            }
        else {           
            res.json(data);            
            }

        });

    };
    

exports.addEventComment=function addEventComment(req,res ){
    
     //eventid, eventforuserid, eventfromuserid, eventtext
   
     var eventData=req.body;
     
     var eventforuserid=req.user.id;
     var usereventid='0';
     var commentpostuserid=req.user.id;
     var commenttext=''


     if((typeof eventData.usereventid=='undefined' || eventData.usereventid=='' || eventData.usereventid=='0' || eventData.usereventid==0))
        {
            res.json({code:"blankeventid", errno:7008, errdesc:"No user Event ID. it is required"});
            return;            
        };

        if((typeof eventData.commenttext=='undefined' || eventData.commenttext==''))
        {
             res.json({code:"blankComment", errno:7009, errdesc:"Comment is blank. Comment is required"});
            return;
        };

     usereventid=eventData.usereventid;
     commenttext=eventData.commenttext;

    userEventmodel.addEventComments(usereventid, commenttext, commentpostuserid,function(data){
          res.json(data);
        });

  };

exports.addEventLike=function addEventLike(req,res ){
    
     //eventid, eventforuserid, eventfromuserid, eventtext
   
     var eventData=req.body;
     
     var eventforuserid=req.user.id;
     var usereventid='0';
     var isLike=1;
     var likepostuserid=req.user.id;     


     if((typeof eventData.usereventid=='undefined' || eventData.usereventid=='' || eventData.usereventid=='0' || eventData.usereventid==0))
        {
            res.json({code:"blankeventid", errno:7008, errdesc:"No user Event ID. it is required"});
            return;            
        };

     usereventid=eventData.usereventid;

    userEventmodel.addEventLikes(usereventid, likepostuserid,function(data){
          res.json(data);
        });

  };