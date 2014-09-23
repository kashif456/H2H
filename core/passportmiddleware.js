var fbstrategy = require( 'passport-facebook' ).Strategy;
var localstrategy = require( 'passport-local' ).Strategy;
var authconf = require( '../conf/authconfig' );
var usermodel = require( '../models/user' );

//blank user for social accounts
var socialuser = {
    username: '',
    lastname: '',
    firstname: '',
    dipslayname: '',
    email: '',
    usertype: '',
    token: '',
    serviceproviderid: ''
};

module.exports = function ( passport ) {

    passport.use( new fbstrategy( {
        clientID: authconf.facebook.clientID,
        clientSecret: authconf.facebook.clientSecret,
        callbackURL: authconf.facebook.callbackURL
    },

        function ( accessToken, refreshToken, profile, done ) {
            usermodel.findOrCreateSocialUser( 'F', accessToken, profile, function ( err, user ) {
                if ( err ) { return done( err ); }
                done( null, user );
            });
        }

        ) );

passport.use(new localstrategy(function(username, password,done){
  
    usermodel.authenticateUser( 'N', username, password, done);

    //Users.findOne({ username : username},function(err,user){
    //    if(err) { return done(err); }
    //    if(!user){
    //        return done(null, false, { message: 'Incorrect username.' });
    //    }

    //    hash( password, user.salt, function (err, hash) {
    //        if (err) { return done(err); }
    //        if (hash == user.hash) return done(null, user);
    //        done(null, false, { message: 'Incorrect password.' });
    //    });
    //});

}));

    //passport.serializeUser( function ( user, done ) {
    //    done( null, user );
    //});

    //passport.deserializeUser( function ( user, done ) {
    //    done( null, user );

    //});

};