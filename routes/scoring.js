var externalapi = require( './extapicall' );

exports.getScore = function ( req, res ) {

    var uuid = "";
    var lane = "";
    var _dc = "";
    var page = "";
    var start = "";
    var limit = "";

    if ( typeof req.query.uuid == 'undefined' )
    { uuid = ""; res.send( "No CenterID" ); return; }
    else {
        uuid = req.query.uuid;
    }

    if ( typeof req.query.lane == 'undefined' ) {
        lane = ""; //res.send("No Lane Number");return;
    }
    else {
        lane = req.query.lane;
    }

    var path = "/callbacks/online_scoring/get_all_lanes.php?uuid=" + uuid;

    if ( typeof req.query._dc != 'undefined' ) {
        path = path + "&_dc=" + req.query._dc;
    }
    if ( typeof req.query.page != 'undefined' ) {
        path = path + "&page=" + req.query.page;
    }
    if ( typeof req.query.start != 'undefined' ) {
        path = path + "&start=" + req.query.start;
    }
    if ( typeof req.query.limit != 'undefined' ) {
        path = path + "&limit=" + req.query.limit;
    }



    var xbdata = "";
    var ltdata = "";

    //Find All the Centers from lanetallk only
    var ltreq = externalapi.getAPIData( 1002, path, function ( err, ltdata ) {

        if ( err ) { console.log( ltdata ); }
        else {
            var resdata = ltdata;
            if ( lane != "" ) {
                res.send( resdata );
            }
            else {

                var lndata = JSON.parse( resdata );

                if ( typeof lndata != 'undefined' ) {

                    resdata = '';
                    var maxLane = lndata.lanes.length;

                    for ( var ln = 0; ln < maxLane; ln++ ) {

                        var laneinfo = lndata.lanes[ln];

                        if ( laneinfo.header.lane_number == lane ) {

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
