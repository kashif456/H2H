var conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );
var bcrypt = require( 'bcrypt-nodejs' );
var mysql = require( 'mysql' );
var sqlpool = mysql.createConnection( {
    host: conf.db.mysql.dbhost,
    user: conf.db.mysql.dbuser,
    password: conf.db.mysql.dbpassword,
    database: conf.db.mysql.database,
    port: conf.db.mysql.dbport
});

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
        " Where u.usertype='" + usertype + "' and u.otheraccountid='" + fbuser.id + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {
            if ( rows.length > 0 ) {
                callback( null, JSON.stringify( rows[0] ) );
                connection.release();
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
                                    callback( null, JSON.stringify( rows[0] ) );
                                    connection.release();
                                }
                                else {
                                    connection.release();
                                    console.error( 'Error while getting user' );
                                    callback( "{result: 'fail',err:'Error while getting user',errcode:5003}", null );
                                }
                            }
                        });

                    }
                    connection.release();
                });

            }

        }
    });
    //    }
    //});


};


exports.createOwnUser = function createOwnUser( usertype, data, callback ) {

    var connection = sqlpool;

    var findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email, " +
        " u.timezone, u.locale, u.otheraccountid, u.token " +
        " from users u " +
        " Where u.usertype='" + usertype + "' and u.username='" + data.email + "' ";

    connection.query( findSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        } else {

            if ( rows.length > 0 ) {
                callback( "{result: 'fail',err:'User already exists',errcode:5001}", null );
                connection.release();
                return;
            }
            else {
                //Create new user

                var displayName = data.lastname + ' ' + data.firstname;
                var dob = ( typeof data.dob == 'undefined' || data.dob==''  ? '1900-01-01' : data.dob );
                var gender = ( typeof data.gender == 'undefined' ? '' : data.gender.charAt( 0 ).toUpperCase() );
                var location = ( typeof data.location == 'undefined' ? '' : data.location );
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
                    " '" + data.email + "','" + password + "','" + data.lastname + "','" + data.firstname + "','" + displayName + "','" + displayName + "','" + dob + "'," +
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
                                    callback( null, JSON.stringify( rows[0] ) );
                                    connection.release();
                                }
                                else {
                                    connection.release();
                                    console.error( 'Error while creating user' );
                                    callback( "{result: 'fail',err:'Error while creating user',errcode:5002}", null );
                                }
                            }
                        });

                    }
                    connection.release();
                });

            }
        }

    });

};

exports.authenticateUser = function authenticateUser( usertype, username, password, callback ) {

    var connection = sqlpool;
    var findSql = "Select u.id,userpwd, pwdsalt, u.token " +
        " from users u " +
        " Where u.usertype='" + usertype + "' and u.username='" + username + "' ";

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
                    " Where u.usertype='" + usertype + "' and u.username='" + username + "' ";
                    connection.query( findSql, function ( err, urows ) {
                        if ( err ) {
                            console.error( err );
                            callback( err, null );
                        }
                        else {
                            callback( null, urows[0] );
                            connection.release();
                        }
                    });
                    return;
                }

            }
            callback( null, false, { message: 'Invalid Credential' });
            connection.release();
        }
    });

};

exports.getUserProfileByID = function getUserProfileByID( userID, callback ) {
    var connection = sqlpool;

    findSql = "Select u.id,u.usertype, u.lastname, u.firstname, u.displayname, u.gender, u.dob, u.email,locationtext, " +
    " u.timezone, u.locale, u.otheraccountid, u.token " +
    " from users u " +
    " Where u.id='" + userID + "'";
    connection.query( findSql, function ( err, urows ) {
        if ( err ) {
            console.error( err );
            callback( err, null );
        }
        else {
            callback( null, urows[0] );
            connection.release();
        }
    });


};

exports.updateUserProfile = function updateUserProfile( userID, data, callback ) {
    var connection = sqlpool;

    var updSql = "UPDATE users SET ";

    if ( data.lastname != '' && typeof data.lastname != 'undefined' ) {
        updSql = updSql + " lastname='" + data.lastname + "', ";
    }
    if ( data.firstname != '' && typeof data.firstname != 'undefined' ) {
        updSql = updSql + " firstname='" + data.firstname + "', ";
    }
    if ( data.displayname != '' && typeof data.displayname != 'undefined' ) {
        updSql = updSql + " displayname='" + data.displayname + "', ";
    }
    if ( data.dob != '' && typeof data.dob != 'undefined' ) {
        updSql = updSql + " dob='" + data.dob + "', ";
    }
    if ( data.gender != '' && typeof data.gender != 'undefined' ) {
        updSql = updSql + " gender='" + data.gender.charAt( 0 ).toUpperCase() + "', ";
    }
    if ( data.locationtext != '' && typeof data.locationtext != 'undefined' ) {
        updSql = updSql + " locationtext='" + data.locationtext + "', ";
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
            callback( err, null );
        } else {
            var appuserid = result.affectedRows;
            callback( null, 'Updated user profile: rows affected:'+appuserid );
            connection.release();

        }
        
    });
    }

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
            callback( null, 'Updated user image: rows affected:'+appuserid );
            connection.release();

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
            connection.release();
        }
    });

    };