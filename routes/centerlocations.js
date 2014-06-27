//var https = require('https');
//var http = require('http');
//var externalapi= require('../conf/appconfig').get('externalapi');
var externalapi = require( './extapicall' );

exports.findLocationAll = function ( req, res ) {

    var xbdata = "";
    var ltdata = "";
    var xbreq = externalapi.getAPIData( 1001, '', function ( err, xbdata ) {
        if ( err ) { console.log( xbdata ); }
        else {

            var ltreq = externalapi.getAPIData(1002,'', function ( lterr, ltdata ) {

                if ( lterr ) { console.log( ltdata ); }
                else {
                    var resdata = "[{\"apiid\":\"1001\", \"apidata\":" + xbdata + "},{\"apiid\":\"1002\", \"apidata\":" + ltdata + "}]";
                    res.send(resdata);
                }
            });

        }        

    });

    //var resdata= "[{\"apiid\":\"1001\", \"apidata\":"+xbdata+"},{\"apiid\":\"1001\", \"apidata\":"+ltdata+"}]";

};

exports.findByAdministrativeArea =function(req,res){
    if (typeof req.params.apiid=='undefined')
        {res.send('apiid not exist'); return;}

    if (typeof req.params.country=='undefined')
        {res.send('country not exist'); return;}

   if (typeof req.params.area=='undefined')
        {res.send('area not exist'); return;}

   var xbdata = "";
   
   var ltdata = "";   

   var endpoint=(req.params.apiid===1001) ? "/United%20States/Illinois?scoringType=Machine":"";
 var xbreq = externalapi.getAPIData( req.params.apiid, endpoint, function ( err, xbdata ) {
        if ( err ) { console.log( xbdata ); }
        else {
             var resdata = "[{\"apiid\":\"1001\", \"apidata\":" + xbdata + "}]";
        res.send(resdata);
            
        }        

    });      

    

    };

exports.findLaneByCenterID =function(req,res){
    if (typeof req.params.apiid=='undefined')
        {res.send('apiid not exist'); return;}

    if (typeof req.params.centerid=='undefined')
        {res.send('country not exist'); return;}

   var xbdata = "";
   
   var ltdata = "";   

   var endpoint=(req.params.apiid===1001) ? "":"/callbacks/online_scoring/get_all_lanes.php?uuid="+req.params.centerid;
 var xbreq = externalapi.getAPIData( req.params.apiid, endpoint, function ( err, xbdata ) {
        if ( err ) { console.log( xbdata ); }
        else {
             var resdata = "[{\"apiid\":\"1001\", \"apidata\":" + xbdata + "}]";
        res.send(resdata);
            
        }        

    });      

    

    };


    exports.VenueInfo =function(req,res){
    if (typeof req.query.apiid=='undefined')
        {res.send('apiid not exist'); return;}

    if (typeof req.query.venueid=='undefined')
        {res.send('venueid not exist'); return;}

    if (typeof req.query.from=='undefined')
        {res.send('from not exist'); return;}

   var xbdata = "";
   
   var ltdata = "";   

   var endpoint=(req.query.apiid===1001) ? "/venue/"+req.query.venueid+"/summary?from="+req.query.from:"";
 var xbreq = externalapi.getAPIData( req.query.apiid, endpoint, function ( err, xbdata ) {
        if ( err ) { console.log( xbdata ); }
        else {
             var resdata = "[{\"apiid\":\"1001\", \"apidata\":" + xbdata + "}]";
        res.send(resdata);
            
        }        

    });      

    

    };





/*exports.findCountry =function(req,res) {

    //from xbowling
    console.log(externalapi.xbowling.apihost);
    var client = https.createClient(externalapi.xbowling.apiport, externalapi.xbowling.apihost);

    console.log(externalapi.xbowling.apipathlocations+externalapi.xbowling.apidefaultqs);
    var request = client.request('GET', externalapi.xbowling.apipathlocations+externalapi.xbowling.apidefaultqs);


    request.addListener("response", function(response) { //Add listener to watch for the response
        var body = "";
        response.addListener("data", function(data) { //Add listener for the actual data
            body += data; //Append all data coming from api to the body variable
        });

        response.addListener("end", function() { //When the response ends, do what you will with the data
            var response = JSON.parse(body); 
        });
    });
    request.end();
    res.send(response);

    };*/