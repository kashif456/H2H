var externalapi = require( './extapicall' );
var geolib = require( 'geolib' );

exports.findCenters = function ( req, res ) {

    var lon = '';
    var lat = '';
    var distance = '';

    if ( typeof req.query.lon == 'undefined' )
    { lon = ''; }
    else {
        lon = req.query.lon;
    }

    if ( typeof req.query.lat == 'undefined' )
    { lat = ''; }
    else {
        lat = req.query.lat;
    }

    if ( typeof req.query.distance == 'undefined' )
    { distance = '-1'; }
    else {
        distance = req.query.distance;
    }


    var xbdata = '';
    var ltdata = '';

    //Find All the Centers from lanetallk only
    var ltreq = externalapi.getAPIData( 1002, '/callbacks/online_scoring/get_ios_customers.php', function ( err, ltdata ) {

        if ( err ) { console.log( ltdata ); }
        else {

            if ( lon != '' && lat != ''  ) {

                var mydata = JSON.parse( ltdata );
                var cntrs = '';                                       
                        mydata.forEach( function ( cdata ) {
                            var cust = cdata.customers;
                            cust.forEach( function ( gdata ) {

                                if (gdata.latitude.trim() !='' && gdata.longitude.trim() !='')
                                    {
                                    var distmtr = geolib.getDistance(
                                        { latitude: lat, longitude: lon },
                                        { latitude: gdata.latitude, longitude: gdata.longitude }
                                        );

                                    var distmiles = geolib.convertUnit( 'mi', distmtr, 2 );

                                    if ( distmiles <= distance || distance=='-1' ) {
                                        gdata.distance = distmiles;
                                        if ( cntrs == '' ) {
                                            cntrs = '[' + JSON.stringify( gdata );
                                        }
                                        else {
                                            cntrs = cntrs + ',' + JSON.stringify( gdata );
                                        }
                                }
                                }
                            });
                        });

                        if ( cntrs != '' ) {
                            cntrs = cntrs + ']';
                            var tmp = JSON.parse( cntrs );
                            if(distance=='-1')
                                {
                                    var tmp2 = tmp.sort( function ( a, b ) {
                                       var s1=a.location.toLowerCase().replace(',','').replace(' ','');
                                       var s2=b.location.toLowerCase().replace(',','').replace(' ','');
                                    return ((s1 == s2) ? 0 : ((s1 > s2) ? 1 : -1 )); 
                                });
                                cntrs = JSON.stringify( tmp2 );

                                    }
                            else
                                {
                                var tmp1 = tmp.sort( function ( a, b ) {
                                    return a.distance - b.distance;
                                });
                                cntrs = JSON.stringify( tmp1 );
                            }                            
                        }
                        else {
                           // cntrs = 'No centers within ' + distance + ' miles';
                           cntrs ={message:'No centers within ' + distance + ' miles'}
                        }
                        res.send( cntrs );
                   
            }
            else {
                res.send( ltdata );
            };


        }
    });

};

exports.findCentersAllLanes = function ( req, res ) {

    var uuid = "";

    var path = "/callbacks/online_scoring/get_all_lanes.php?";

    if ( typeof req.params.uuid == 'undefined' )
    { res.send( "No Lanes" ); return; }
    else {
        uuid = req.params.uuid;
        path = path + 'uuid=' + uuid
    }


    var xbdata = "";
    var ltdata = "";

    //Find All the lanes by center ID from lanetallk only
    var ltreq = externalapi.getAPIData( 1002, path, function ( err, ltdata ) {

        if ( err ) { console.log( ltdata ); }
        else {
            var resdata = ltdata;

            if ( typeof req.params.lnid == 'undefined' ) {
                res.send( resdata );
            }
            else {

                var lndata = JSON.parse( resdata );

                if ( typeof lndata != 'undefined' ) {

                    resdata = '';
                    var maxLane = lndata.lanes.length;

                    for ( var ln = 0; ln < maxLane; ln++ ) {

                        var laneinfo = lndata.lanes[ln];

                        if ( laneinfo.header.lane_number == req.params.lnid ) {

                            resdata = JSON.stringify( laneinfo );
                            break;
                        }

                    }

                }
                if ( resdata != '' ) {
                    res.send( resdata );

                }
                else {
                    res.send( '{No Data}' );
                }

            }



        }
    });

};

