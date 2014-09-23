var conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );
var bcrypt = require( 'bcrypt-nodejs' );
var mysql = require( 'mysql' );
var jwt = require('jwt-simple');
var moment = require('moment');
var userEventmodel=require( '../models/userevents' );

var sqlpool = mysql.createConnection( {
    host: conf.db.mysql.dbhost,
    user: conf.db.mysql.dbuser,
    password: conf.db.mysql.dbpassword,
    database: conf.db.mysql.database,
    port: conf.db.mysql.dbport
});

var GenToken= function createUserToken(userType,userData,callback)
{
                           var date = new Date();
                       var expires = moment().add('days', 30).valueOf();

             if (userType=="N")
                   {
                       var token = jwt.encode(
							{
								iss: userData.id,
								exp: expires
							}, 
							conf.application.jwtSecrete
						);	
                       callback(null,userType+token);

                       }
               else if (userType !="N")
                   {
                       if (userType=="")
                           userType="O";

                        var token = jwt.encode(
							{
								iss: userData.id,
								exp: expires
							}, 
							conf.application.jwtSecrete
						);	
                       callback(null,userType+token);


                       }
               else {
                    res.json({code:"loginfailed", errno:1005, errdesc:"Failed to generate token"})       
                   }

    }

exports.createUserToken=GenToken;

exports.findOrCreateSocialUser = function findOrCreateUser( usertype, token, socialuser, callback ) {

    var fbuser = socialuser;

    var connection = sqlpool;

    //mysql.getConnection( function ( err, connection ) {
    //    if ( err ) {
    //        console.error( 'CONNECTION error: ', err );
    //        callback( true, err );
    //    } else {

    var findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
        " u.timezone, u.locale, u.otheraccountid, u.token " +
        " from users u " +
        " Where u.usertype like '%" + usertype + "%' and u.otheraccountid='" + fbuser.id + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {
            if ( rows.length > 0 ) {
                callback( null, rows[0]  );
                //connection.release();
            }
            else {
                var adduser = " INSERT INTO `users`(`username`,`userpwd`,`lastname`,`firstname`,`fullname`,`displayname`,`dob`,`gender`,`email`," +
                    " `locationtext`,`locationgeometry`,`usertype`,`locale`,`timezone`,`otheraccountid`,`token`,`isverified`,`pwdsalt`,`isdisabled`,`lastlogin`," +
                    " `pwdattempt`)" +
                    " VALUES ( " +
                    " '" + fbuser.id + "',null,'" + fbuser.name.familyName + "','" + fbuser.name.givenName + "','" + fbuser.displayName + "','" + fbuser.displayName + "',null," +
                    " '" + fbuser.gender.charAt( 0 ).toUpperCase() + "','','',null,'" + usertype + "','" + fbuser._json.locale + "'," + fbuser._json.timezone + "," +
                    " '" + fbuser.id + "','" + token + "',1,null,0,NOW(),null);";


                connection.query( adduser, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( err, null );
                    } else {
                        var appuserid = result.insertId;

                        connection.query( findSql, function ( err, rows ) {
                            if ( err ) {
                                console.error( err );
                                callback( err, null );
                            } else {
                                if ( rows.length > 0 ) {
                                    //create token and assign.
                                    //GenToken(usertype, rows[0], function(terr, tData){
                                            
                                    //     if(terr) {
                                    //         callback( terr, null  );
                                    //         }
                                    //     else
                                    //         {
                                    //              rows[0].token=tData;
                                    //             callback( null, rows[0] );
                                    //             }

                                    //    }); 
                                    callback( null, rows[0] );
                                    //connection.release();
                                }
                                else {
                                    //connection.release();
                                    console.error( 'Error while getting user' );
                                    callback( {result: 'fail',err:'Error while getting user',errcode:5003}, null );
                                }
                            }
                        });

                        userEventmodel.addUserEvents(101,appuserid, 0, fbuser.displayName);
                    }
                    //connection.release();
                });

            }

        }
    });
    //    }
    //});


};

exports.addSocialUsers = function addSocialUsers( usertype, socialuser, callback ) {

    var fbuser = socialuser;

    var connection = sqlpool;    

    usertype=fbuser.provider.charAt( 0 ).toUpperCase();

    var usrfullname=fbuser.name.replace("'","''");

    var findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
        " u.timezone, u.locale, u.otheraccountid, u.token " +
        " from users u " +
        " Where u.usertype like '%" + usertype + "%' and u.otheraccountid='" + fbuser.provider_id + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {
            if ( rows.length > 0 ) {
                //create token and assign.
                                    GenToken(usertype, rows[0], function(terr, tData){
                                            
                                         if(terr) {
                                             callback( terr, null  );
                                             }
                                         else
                                             {
                                                  rows[0].token=tData;
                                                 callback( null, rows[0] );
                                                 }

                                        }); 
                //callback( null, rows[0]  );
                //connection.release();
            }
            else {
                //var adduser = " INSERT INTO `users`(`username`,`userpwd`,`lastname`,`firstname`,`fullname`,`displayname`,`dob`,`gender`,`email`," +
                //    " `locationtext`,`locationgeometry`,`usertype`,`locale`,`timezone`,`otheraccountid`,`token`,`isverified`,`pwdsalt`,`isdisabled`,`lastlogin`," +
                //    " `pwdattempt`,`userimageurl`)" +
                //    " VALUES ( " +
                //    " '" + fbuser.email + "',null,'" + usrfullname + "',' ','" + usrfullname + "','" + usrfullname + "',null," +
                //    " '','"+fbuser.email+"','',null,'" + usertype + "','',null," +
                //    " '" + fbuser.provider_id + "',null,1,null,0,NOW(),null,'"+fbuser.image_url+"');";

                var adduser="CALL uspAddSocialUser ('" + fbuser.email + "','" + usrfullname + "','" + fbuser.provider_id + "','"+fbuser.image_url+"')";

                connection.query( adduser, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( err, null );
                    } else {
                        //var appuserid = result.insertId;

                        connection.query( findSql, function ( err, rows ) {
                            if ( err ) {
                                console.error( err );
                                callback( err, null );
                            } else {
                                if ( rows.length > 0 ) {
                                    //create token and assign.
                                    GenToken(usertype, rows[0], function(terr, tData){
                                            
                                         if(terr) {
                                             callback( terr, null  );
                                             }
                                         else
                                             {
                                                  rows[0].token=tData;
                                                 callback( null, rows[0] );
                                                 }

                                        }); 
                                    //callback( null, rows[0] );
                                    //connection.release();
                                }
                                else {
                                    //connection.release();
                                    console.error( 'Error while getting user' );
                                    callback( {result: 'fail',err:'Error while getting user',errcode:5003}, null );
                                }
                            }
                        });

                       // userEventmodel.addUserEvents(101,appuserid, 0, fbuser.displayName);
                    }
                    //connection.release();
                });

            }

        }
    });
    


};

exports.getUserByToken=function getUserByToken(token,callback)
{

    var connection = sqlpool;

    var findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
        " u.timezone, u.locale, u.otheraccountid, u.token " +
        " from users u " +
        " Where u.token='" + token + "'";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {
            if ( rows.length > 0 ) {
                callback( null, rows[0]  );
                //connection.release();
            }
            else
                {
                    callback( {result: 'TknFailed',err:'Wrong Token or expired, Re-login',errcode:5023}, null );
                    }

         }
       });
    };

exports.createOwnUser = function createOwnUser( usertype, data, callback ) {

    var connection = sqlpool;

    var findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
        " u.timezone, u.locale, u.otheraccountid, u.token " +
        " from users u " +
        " Where  u.username='" + data.email.trim() + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {

            if ( rows.length > 0 ) {
                callback(null, {code:'adduser', errno:2006, errdesc:'User already exists'} );
                //connection.release();
                return;
            }
            else {
                //Create new user

                var displayName = data.lastname.replace("'","''") + ' ' + data.firstname.replace("'","''");
                var dob = ( typeof data.dob == 'undefined' || data.dob==''  ? '1900-01-01' : data.dob );
                var gender = ( typeof data.gender == 'undefined' ? '' : data.gender.charAt( 0 ).toUpperCase() );
                var location = ( typeof data.location == 'undefined' ? '' : data.location.replace("'","''") );
                var longitude = ( typeof data.longitude == 'undefined' ? '' : data.longitude );
                var latitude = ( typeof data.latitude == 'undefined' ? '' : data.latitude );
                var locale = ( typeof data.locale == 'undefined' ? 'en_US' : data.locale );
                var timezone = ( typeof data.timezone == 'undefined' || data.timezone=='' ? null : data.timezone );
                var password = data.password;

                var salt = bcrypt.genSaltSync( 12 );
                password = bcrypt.hashSync( data.password, salt );

                var geom = 'POINT(0,0)'
                        if ( longitude != '' && latitude != '' ) {
                    geom = 'POINT(' + latitude + ',' + longitude + ')';
                }


                var adduser = " INSERT INTO `users`(`username`,`userpwd`,`lastname`,`firstname`,`fullname`,`displayname`,`dob`,`gender`,`email`," +
                    " `locationtext`,`locationgeometry`,`usertype`,`locale`,`timezone`,`otheraccountid`,`token`,`isverified`,`pwdsalt`,`isdisabled`,`lastlogin`," +
                    " `pwdattempt`)" +
                    " VALUES ( " +
                    " '" + data.email.trim() + "','" + password + "','" + data.lastname + "','" + data.firstname + "','" + displayName + "','" + displayName + "','" + dob + "'," +
                    " '" + gender + "','" + data.email + "','" + location + "'," + geom + ",'" + usertype + "','" + locale + "'," + timezone + "," +
                    " 'null','null',1,'" + salt + "',0,utc_timestamp(),null);";


                connection.query( adduser, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( err, null );
                    } else {
                        var appuserid = result.insertId;

                        connection.query( findSql, function ( err, rows ) {
                            if ( err ) {
                                console.error( err );
                                callback( err, null );
                            } else {
                                if ( rows.length > 0 ) {

                                    //create token and assign.
                                    GenToken(usertype, rows[0], function(terr, tData){
                                            
                                         if(terr) {
                                             callback( terr, null  );
                                             }
                                         else
                                             {
                                                  rows[0].token=tData;
                                                 callback( null, rows[0]  );
                                                 }

                                        }); 
                                    //callback( null, rows[0]  );
                                }
                                else {                                    
                                    console.error( 'Error while creating user' );
                                    callback( {code:'adduser', errno:2005, errdesc:'error while adding user'}, null );
                                }
                            }
                        });

                    }
                    //connection.release();
                });

            }
        }

    });

};

exports.authenticateUser = function authenticateUser( usertype, username, password, callback ) {

    var connection = sqlpool;
    var findSql = "Select u.id, IFNULL(userpwd,'') as userpwd, pwdsalt, u.token " +
        " from users u " +
        " Where  u.username='" + username.replace("'","''") + "' ";
        //" Where u.usertype like '%" + usertype + "%' and u.username='" + username.replace("'","''") + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
            return;
        } else {

            if ( rows.length > 0 ) {
                var salt = rows[0].pwdsalt;
                var calpassword = bcrypt.hashSync( password, salt );

                if ( rows[0].userpwd == calpassword ) {
                    findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
                    " u.timezone, u.locale, u.otheraccountid, u.token " +
                    " from users u " +
                    " Where u.username='" + username.replace("'","''") + "' ";
                    //" Where u.usertype like '%" + usertype + "%' and u.username='" + username + "' ";
                    connection.query( findSql, function ( err, urows ) {
                        if ( err ) {
                            console.error( err );
                            callback( err, null );
                        }
                        else {
                            callback( null, urows[0] );
                            //connection.release();
                        }
                    });
                    return;
                }

            }
            callback( null, false, {code:'authfailed', errno:1002, errdesc:'Invalid Credential'});
            
        }
    });

};

exports.getUserByID = function getUserByID( userID, callback ) {
    var connection = sqlpool;

    findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email,locationtext, " +
    " u.timezone, u.locale, u.otheraccountid " +
    " from users u " +
    " Where u.id='" + userID + "'";
    connection.query( findSql, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( {code:'userprofile', errno:20011, errdesc:'error while getting user'}, null );
        }
        else {
            callback( null, urows[0] );
            //connection.release();
        }
    });


};

exports.getUserProfileByID = function getUserProfileByID( userID, callback ) {
    var connection = sqlpool;

    findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email,locationtext, " +
    " u.timezone, u.locale, u.otheraccountid " +
    " from users u " +
    " Where u.id='" + userID + "'";
    connection.query( findSql, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( {code:'userprofile', errno:20011, errdesc:'error while getting user profile'}, null );
        }
        else {
            callback( null, urows[0] );
            //connection.release();
        }
    });


};

exports.updateUserProfile = function updateUserProfile( userID, data, callback ) {
    var connection = sqlpool;

    var updSql = "UPDATE users SET ";

    if ( data.lastname != '' && typeof data.lastname != 'undefined' ) {
        updSql = updSql + " lastname='" + data.lastname.replace("'","''") + "', ";
    }
    if ( data.firstname != '' && typeof data.firstname != 'undefined' ) {
        updSql = updSql + " firstname='" + data.firstname.replace("'","''") + "', ";
    }
    if ( data.displayname != '' && typeof data.displayname != 'undefined' ) {
        updSql = updSql + " displayname='" + data.displayname.replace("'","''") + "', ";
    }
    if ( data.dob != '' && typeof data.dob != 'undefined' ) {
        updSql = updSql + " dob='" + data.dob + "', ";
    }
    if ( data.gender != '' && typeof data.gender != 'undefined' ) {
        updSql = updSql + " gender='" + data.gender.charAt( 0 ).toUpperCase() + "', ";
    }
    if ( data.locationtext != '' && typeof data.locationtext != 'undefined' ) {
        updSql = updSql + " locationtext='" + data.locationtext.replace("'","''") + "', ";
    }
    

    var longitude = ( typeof data.longitude == 'undefined' ? '' : data.longitude );
    var latitude = ( typeof data.latitude == 'undefined' ? '' : data.latitude );

    var geom = 'POINT(0,0)'
                        if ( longitude != '' && latitude != '' ) {
        geom = 'POINT(' + latitude + ',' + longitude + ')';
        updSql = updSql + " locationgeometry='" + geom + "', ";
    }
    if ( data.locale != '' && typeof data.locale != 'undefined' ) {
        updSql = updSql + " locale='" + data.locale + "', ";
    }

    if ( data.timezone != '' && typeof data.timezone != 'undefined' ) {
        updSql = updSql + " timezone='" + data.timezone + "', ";
    }

    if ( updSql != "UPDATE users SET " ) {
        updSql = updSql + " updateddate=utc_timestamp() where id= " + userID
                        

    connection.query( updSql, function ( err, result ) {
        if ( err ) {
            console.error( err );
            callback( {code:'userprofile', errno:20010, errdesc:'error while updating user profile'}, null );
        } else {
            var appuserid = result.affectedRows;
            callback( null, {message:'Updated user profile: rows affected:'+appuserid} );
            

        }
        
    });
    }

};

exports.getUserList =function getUserList(usernametosearch,currentpage,count,callback){

    var connection = sqlpool;

    //findSql = "Select u.id userid, u.usertype, u.lastname, u.firstname,u.fullname, u.displayname, u.gender " +    
    //" from users u " +
    //" Where (u.displayname like '%" + usernametosearch + "%' OR u.fullname like '%" + usernametosearch + "%' );";

    var items_per_page = count>0?count:conf.application.itemsperpage;

    var start_index = currentpage;//(currentpage - 1) * items_per_page;

    var sqlprc="CALL GetUserOrFriendList (1,'"+usernametosearch+"',0,"+start_index+","+items_per_page+");";

    connection.query( sqlprc, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( {code:'userlist', errno:20014, errdesc:'error while getting user list'}, null );
        }
        else {
            callback( null, urows[0] );
            //connection.release();
        }
    });

  };

 exports.getFriendList =function getFriendList(userID,currentpage,count,callback){

    var connection = sqlpool;

    //findSql = "SELECT u.id,u.usertype, u.lastname, u.firstname,u.fullname, u.displayname, u.gender " +    
    //" FROM userfriends uf JOIN users u on uf.friendid=u.id " +
    //" WHERE uf.userid='" + userID + "';";
    var items_per_page = count>0?count:conf.application.itemsperpage;

    var start_index = currentpage; // (currentpage - 1) * items_per_page;

    var sqlprc="CALL GetUserOrFriendList (2,'',"+userID+","+start_index+","+items_per_page+");";

    connection.query( sqlprc, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( {code:'userlist', errno:20014, errdesc:'error while getting user list'}, null );
        }
        else {
            callback( null, urows[0] );
            //connection.release();
        }
    });

  };

exports.sendFriendRequest=function sendFriendRequest(usrID, frienduserid,callback){

    var connection = sqlpool;

    var sqlprc="CALL AddUpdateFriends ("+usrID+","+frienduserid+",0);";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"sendFrndReq", errno:7020, errdesc:'Error while Sending Friend request'} )
        } else {
                callback({result: 'success',msg:'Friend request sent successfully'} );
        }
    });

  };

exports.acceptFriendRequest=function acceptFriendRequest(usrID, frienduserid,callback){

    var connection = sqlpool;

    var sqlprc="CALL AddUpdateFriends ("+usrID+","+frienduserid+",1);";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"sendFrndReq", errno:7020, errdesc:'Error while accept Friend request'} )
        } else {
                callback({result: 'success',msg:'Friend request accepted.'} );
        }
    });

  };

exports.updateFriendRequest=function updateFriendRequest(usrID, frienduserid,frstatus,callback){

    var connection = sqlpool;

    var sqlprc="CALL AddUpdateFriends ("+usrID+","+frienduserid+","+frstatus+");";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"sendFrndReq", errno:7022, errdesc:'Error while updaitng Friend request status'} )
        } else {
                callback({result: 'success',msg:'Friend request updated.'} );
        }
    });

  };

exports.getFriendRequest= function getFriendRequest(usrID,typeid,callback){

    var connection = sqlpool;

    var sqlprc="CALL GetFriendRequestByUserID ("+usrID+","+typeid+");";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errfrnreq", errno:8024, errdesc:'Error while getting friend request'} )
        } else {
                callback( null, rows[0] );
        }
    });
    }; 

exports.addUserNotification= function addUserNotification(usrID, foruserid,typeid,textmsg,callback){

    var connection = sqlpool;

    var sqlprc="CALL AddUserNotification ("+usrID+","+foruserid+","+typeid+",'"+textmsg.replace("'","''")+"');";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errnotification", errno:8020, errdesc:'Error while adding notification'} )
        } else {
                callback({result: 'success',msg:'Notification added.'} );
        }
    });

    };

exports.getUserNotification= function getUserNotification(usrID,callback){

    var connection = sqlpool;

    var sqlprc="CALL GetNotificationByUserID ("+usrID+");";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errnotification", errno:8021, errdesc:'Error while getting notification'} )
        } else {
                callback( null, rows[0] );
        }
    });
    }; 

exports.ignoreUserNotification= function ignoreUserNotification(notificationid,callback){

    var connection = sqlpool;

    var sqlprc="CALL UpdateNotificationByID ("+notificationid+",1);";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errnotification", errno:8022, errdesc:'Error while updating notification'} )
        } else {
                callback({result: 'success',msg:'Notification Ignored.'} );
        }
    });
  }; 

  exports.remmoveUserNotification= function remmoveUserNotification(notificationid,callback){

    var connection = sqlpool;

    var sqlprc="CALL UpdateNotificationByID ("+notificationid+",2);";

    connection.query( sqlprc, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errnotification", errno:8023, errdesc:'Error while updating notification'} )
        } else {
                callback({result: 'success',msg:'Notification Removed.'} );
        }
    });
  }; 

exports.updateUserImage=function updateUserImage(userID,filePath,callback){

    var connection = sqlpool;

    var updSql = "UPDATE users SET userimage='"+filePath+"' Where id="+userID;

    connection.query( updSql, function ( err, result ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {
            var appuserid = result.affectedRows;
            callback( null, {message:'Updated user image: rows affected:'+appuserid} );
//            connection.release();

        }
        
    });
    };

exports.getUserImageByID =function getUserImageByID(userID,callback){

    var connection = sqlpool;

    var findSql = "select userimage from users Where id="+userID;
    connection.query( findSql, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        }
        else {
            callback( null, urows[0].userimage );
            //connection.release();
        }
    });

    };

exports.addupdateCheckin =function addupdateCheckin(userID,data,callback){
    
        var checkinid =(typeof data.checkinid=='undefined' || data.checkinid==0 || data.checkinid=='0'?0:data.checkinid);  
        var userid =userID; 
        var centerTypeID=(typeof data.centerTypeID=='undefined' || data.centerTypeID==0 || data.centerTypeID=='0'?1002:data.centerTypeID);  
        var centreID=data.centreID;  
        var centreName=(typeof data.centreName=='undefined'?'':data.centreName.replace("'","''"));    
        var laneNo=(typeof data.laneNo=='undefined' || data.laneNo==0 || data.laneNo=='0'?0:data.laneNo);               
        var gameID=(typeof data.gameID=='undefined' || data.gameID==0 || data.gameID=='0'?0:data.gameID);   
        var gameNo=(typeof data.gameNo=='undefined' || data.gameNo==0 || data.gameNo=='0'?0:data.gameNo);                 
        var playerNo=(typeof data.playerNo=='undefined' || data.playerNo==0 || data.playerNo=='0'?0:data.playerNo);               
        var playerName=(typeof data.playerName=='undefined' ?'':data.playerName.replace("'","''"));         

        var strsql="Select id checkinid, userid, centerTypeID, centreID, centreName, laneNo, gameID, gameNo, playerNo, playerName, checkInDate "+
           " From usercheckin Where id=";
        var connection = sqlpool;
    if(checkinid<=0)
        {

             var strsqladd="INSERT INTO  usercheckin (userid, CenterTypeID, CentreID, CentreName, LaneNo, GameID, GameNo, PlayerNo, PlayerName, CheckInDate) "+
                " VALUES ("+userid+","+centerTypeID+",'"+centreID+"','"+centreName+"',"+laneNo+","+gameID+","+gameNo+","+playerNo+",'"+playerName+"', utc_timestamp()); "

                connection.query( strsqladd, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( {code:'checkinerr', errno:30012, errdesc:'error while adding checkin details'}, null );
                    } else {
                        var addedid = result.insertId;

                        strsql= strsql+addedid;
                        connection.query( strsql, function ( err, rows ) {
                            if ( err ) {
                                console.error( err );
                                callback( {code:'checkinerr', errno:30010, errdesc:'error while getting checkin details'}, null );
                            } else {
                                if ( rows.length > 0 ) {
                                    callback( null, rows[0]  );                                    
                                }
                                else {                                    
                                    console.error( 'Error while getting checkin details' );
                                    callback( {code:'checkinerr', errno:3005, errdesc:'error while checkin details'}, null );
                                }
                            }
                        });

                    }                    
                });
            }
    else
        {
             var strsqlUpd="UPDATE usercheckin SET CentreName='"+centreName+"', LaneNo="+laneNo+", GameID="+gameID+", GameNo="+gameNo+", PlayerNo="+playerNo+", PlayerName='"+playerName+"' "+
            " Where id= "+checkinid;

                        connection.query( strsqlUpd, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( {code:'checkinerr', errno:30011, errdesc:'error while updating checkin details'}, null );
                    } else {
                        //var appuserid = result.affectedRows;

                        strsql= strsql+checkinid;
                        connection.query( strsql, function ( err, rows ) {
                            if ( err ) {
                                console.error( err );
                                callback( {code:'checkinerr', errno:30010, errdesc:'error while getting checkin details'}, null );
                            } else {
                                if ( rows.length > 0 ) {
                                    callback( null, rows[0]  );                                    
                                }
                                else {                                    
                                    console.error( 'checkin No rows updated' );
                                    callback( {code:'checkinerr', errno:3006, errdesc:'No records updated'}, null );
                                }
                            }
                        });            

                    }
        
                });

            }    

    };

exports.UserCheckOut=function UserCheckOut(checkinid,callback){

    var connection = sqlpool;
    var strsql="UPDATE usercheckin SET checkOutDate = utc_timestamp() where id='"+checkinid+"';"

    connection.query( strsql, function ( err, result ) {
                    if ( err ) {
                        console.error( err );
                        callback( {code:'checkouterr', errno:30015, errdesc:'error while checking out '}, null );
                    } else {
                            if ( result.affectedRows >0) {
                                    callback(null,{result: 'success',msg:'user checked out'});
                                }
                                else {                                                                       
                                    callback( {code:'checkouterr', errno:30016, errdesc:'No records updated'}, null );
                                }                          
                        }
                    }
                    );



    };

