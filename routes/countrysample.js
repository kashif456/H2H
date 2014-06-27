var https = require('https');

var options = {
    host : 'api.xbowling.com',   //https://api.xbowling.com/venue/locations?scoringType=Machine
    path : '/venue/locations?scoringType=Machine',
    //port : 80,
    method : 'GET'
  };	


console.info('Options prepared:');
console.info(options);
console.info('Do the GET call');

exports.findCountry =function(req,res) {

	var request = https.request(options, function(response){
	    var body = ""

	    response.on('data', function(data) {
	      body += data;
	    });

	    response.on('end', function() {
	      res.send(JSON.parse(body));
	    });

	  });

	  request.on('error', function(e) {
	    console.log('Problem with request: ' + e.message);
	  });

  request.end();

};
