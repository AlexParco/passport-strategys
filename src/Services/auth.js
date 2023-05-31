const passport = require('passport')
const jwt = require('jsonwebtoken');
// const { UserModel, UserSchema } = require('../model/user') 
const GoogleStrategy = require('passport-google-oauth2').Strategy
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = require('passport-jwt').Strategy

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  function(username, password, done) {
    // UserModel.findOne({ username })
    // .then(user => {
    //   if(!user) {
    //     return done(null, false) 
    //   }
    //   return done(null, user);
    // })
    // .catch(err => {
    //     return done(err);
    // });
    if(username === "admin" && password === "admin") {
      return done(null, {
        username,
        password
      })
    }else {
      return done(null, false)
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    callbackURL: process.env.OIDC_CALLBACK_URL,
    passReqToCallback: true,
  },
  function(request, accesToken, refreshToken, profile, done) {
    return done(null, profile);
}))

passport.use(new JWTStrategy({
  jwtFromRequest: req => req.cookies.jwt,
  secretOrKey: process.env.JWT_SECRET_KEY
}, (payload, done) => {

  const user = payload;
  done(null, user);
}));

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

const generateToken = ({role, user}) => {
  const claims = {
    sub: user,
    iss: `localhost:${process.env.PORT}`,
    aud: `localhost:${process.env.PORT}`,
    exp: Math.floor(Date.now() / 1000) + 604800,
    role
  }
  return jwt.sign(claims, process.env.JWT_SECRET_KEY)
}

module.exports = {
  generateToken
}