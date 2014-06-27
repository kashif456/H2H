var https = require( 'https' );
var http = require( 'http' );
var externalapi = require( '../conf/appconfig' ).get( 'externalapi' );


exports.getAPIData = function ( apiid, path,callback) {

    var defhost = externalapi.xbowling.apihost;
    var defpath = externalapi.xbowling.apipathlocations + externalapi.xbowling.apidefaultqs;    

    if ( apiid == 1002 ) {
        defhost = externalapi.lanetalk.apihost; 
        defpath       = externalapi.lanetalk.apipathlocations;
    }
    else {
        host = externalapi.xbowling.apihost;
       defpath = externalapi.xbowling.apipathlocations+externalapi.xbowling.apidefaultqs; 
    }

    if( path!='')
        {
            defpath=path;
        }

    var options = {
        host: defhost,
        path: defpath,
        //port : externalapi.xbowling.apiport,
        method: 'GET'
    };


    //console.log( defhost+defpath);

    if ( apiid == 1002 ) {
        var request = http.request( options, function ( response ) {
        var body = ""

	    response.on( 'data', function ( data ) {
            body += data;
        });

        response.on( 'end', function () {
            //res.send( JSON.parse( body ) );     
            callback(false,body); 
        });

    });
    
    request.on( 'error', function ( e ) {               
        callback(true,'Problem with request 1002: ' + e.message); 
        
    });
    request.end();
        }
    else
        {
	var request = https.request( options, function ( response ) {
        var body = ""

	    response.on( 'data', function ( data ) {
            body += data;
        });

        response.on( 'end', function () {
            //res.send( JSON.parse( body ) );     
            callback(false,body); 
        });

    });
    
    request.on( 'error', function ( e ) {               
        callback(true,'Problem with request 1001: ' + e.message); 
        
    });
    request.end();
    }

};