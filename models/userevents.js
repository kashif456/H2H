var conf = require( '../conf/appconfig' ).get( process.env.NODE_ENV );
var mysql = require( 'mysql' );
var moment = require( 'moment' );

var sqlpool = mysql.createConnection( {
    host: conf.db.mysql.dbhost,
    user: conf.db.mysql.dbuser,
    password: conf.db.mysql.dbpassword,
    database: conf.db.mysql.database,
    port: conf.db.mysql.dbport
});

//Common function to add events

var addUserEvent = function addUserEvent( eventid, eventforuserid, eventfromuserid, eventtext,callback ) {

    var connection = sqlpool;

    var params = eventid + "," + eventforuserid + "," + eventfromuserid + ",'" + eventtext.replace("'","''") + "'";

    var strSql='CALL AddUserEvents ('+params+')';

    connection.query( strSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errEventAdd", errno:7001, errdesc:'Error while adding events'} )
        } else {
                callback({result: 'success',msg:'added user event'} );
        }
    });
};

exports.addUserEvents=addUserEvent;

exports.GetUserEvents=function GetUserEvents(userid, frienduserid,currentpage,count,callback){

    //var current_page = currentpage;

    //if(request.query.pageno>0)
    //    current_page=request.query.pageno
    
    var items_per_page =count>0?count:conf.application.itemsperpage;

    var start_index =currentpage; // (currentpage - 1) * items_per_page;

    var strsql="CALL GetUserEvents ("+userid+","+frienduserid+","+start_index+","+items_per_page+");";  //"Select * from userevents where  userid='"+userid+"';";

    var connection = sqlpool;

    connection.query( strsql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {result: 'fail',err:'Error while getting user events',errcode:7004}, null )
        } else {
                callback(null, rows[0] );
        }
    });

    };

exports.GetEventComments=function GetEventComments(userid,eventid,currentpage,count,callback){

    //var current_page = currentpage;

    //if(request.query.pageno>0)
    //    current_page=request.query.pageno
    
    var items_per_page =count>0?count:conf.application.itemsperpage;

    var start_index =currentpage; // (currentpage - 1) * items_per_page;

    var strsql="CALL GetEventComments ("+userid+","+eventid+","+start_index+","+items_per_page+");";  //"Select * from userevents where  userid='"+userid+"';";

    var connection = sqlpool;

    connection.query( strsql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {result: 'fail',err:'Error while getting user events',errcode:7004}, null )
        } else {
                callback(null, rows[0] );
        }
    });

    };


exports.addEventComments = function addEventComments( usereventid, commenttext, commentpostuserid,callback ) {

    var connection = sqlpool;    

    var strSql="INSERT INTO eventcomments (usereventid, commenttext, commentpostuserid, commentpostdate) "+
                " VALUES ("+usereventid+", '"+commenttext+"',"+commentpostuserid+", utc_timestamp());";

    connection.query( strSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errEventCommentAdd", errno:7003, errdesc:'Error while adding events'} )
        } else {
                callback({result: 'success',msg:'added event comment'} );
        }
    });

};

exports.addEventLikes = function addEventLikes( usereventid, likepostuserid,callback ) {

    var connection = sqlpool;    

    var strSql="CALL AddEventLike ("+usereventid+",1,"+likepostuserid+");";

    connection.query( strSql, function ( err, rows ) {
        if ( err ) {
            console.error( err );
            callback( {code:"errEventLikeAdd", errno:7004, errdesc:'Error while adding events'} )
        } else {
                //callback({result: 'success',msg:'added event like'} );
                callback(rows[0]);
        }
    });

};


