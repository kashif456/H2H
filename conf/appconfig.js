var tool = require('cloneextend'),
    conf = {};
    conf.externalapi ={
        xbowling:{
                apiid:1001,
                apihost:'api.xbowling.com',
                apipathlocations:'/venue/locations',//to get location list of country and centers by city,state,area ..
                apidefaultqs:'?scoringType=Machine',
                apiport:443
            },
        lanetalk:{
                apiid:1002,
                apihost:'www.lanetalk.com',
                apipathlocations:'/callbacks/online_scoring/get_ios_customers.php',//to get location list of country and centers by city,state,area ..
                apidefaultqs:'',
                apiport:80
            }
        };
    conf.development = {
        db:             {
            mysql:          {
                dbhost        : '127.0.0.1',
                dbuser        : 'bowling',
                dbpassword    : 'bwl123',
                database    : 'bowling',
                dbport : 3306
            }
        },
        filepath:{
            userimagepath:'C:/Data/Unicus/Projects/Bowling/NodejsBowling/HHBowling/userimages'
            },
        application:    {
            errorHandler: { dumpExceptions: true, showStack: true }
        }
    };
    conf.defaults = {
        application:    {
            salt        : 'dp4512ms',
            username    : 'dipesh',
            password    : 'D=M@Hp+esRGRDSRTnoDeJs==',
            realm       : 'Authenticated',
            routes      : ['list'],
            middleware  : ['compress','json','urlencoded','logger','bodyParser','cookieParser']
        },
        server:         {
            host        : 'localhost',
            port        : 3000
        }
    };

exports.get = function get(env, obj){
    var settings = tool.cloneextend(conf.defaults, conf[env]);
    return ('object' === typeof obj) ? tool.cloneextend(settings, obj) : settings;
}