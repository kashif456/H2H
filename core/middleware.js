exports.setup = function setup(app, conf){
    var mysql   = require('mysql')
      , express = require('express')
      , pool    = mysql.createPool({
            host     :'', // conf.db.mysql.dbhost,
            user     :'', // conf.db.mysql.dbuser,
            password :'', // conf.db.mysql.dbpassword,
            database :'', // conf.db.mysql.database,
            port : conf.db.mysql.dbport
        });            
    
      app.set('jwtTokenSecret', 'tknSecrt@dp12');

    app.configure(function(){
        conf.application.middleware.forEach(function(val){
            app.use(express[val]());
        });       

        app.use(express.errorHandler(conf.application.errorHandler));
        app.use(function(req, res, next) {
            req.mysql   = pool;            
            req.store   = app.locals;            
            next();
        });
    });
};