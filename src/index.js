const express = require('express')
const session = require('express-session')

const passport = require('passport')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config({
  path: './.env.dev'
})
const AUTH = require('./Services/auth')

const app = express()

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.sendFile('./view/login.html', {root: __dirname})
})

app.post('/auth/login', (req, res, next) =>  {
  passport.authenticate('local',{ 
    session: false,
  },(err, user, info) => {
    if (err || !user) {
      return res.redirect('/failure')
    }
    const token = AUTH.generateToken({ role: 'user', user: user.username, data: user});
    res.cookie('jwt', token, { httpOnly: true });
    return res.redirect('/home');
  })(req, res, next)
});

// google auth 
app.get('/google/login', (req, res, next) => {
  return passport.authenticate('google', 
    {scope: ['profile']}
  )(req, res, next);
})

app.get('/oidc/cb', (req, res, next) => {
  return passport.authenticate('google', {
    session: false
  }, (err, user, info) => {
    if (err || !user) {
      return res.redirect('/failure')
    }
    const token = AUTH.generateToken({ role: 'user', user: user.given_name, data: user});
    res.cookie('jwt', token, { httpOnly: true });
    return res.redirect('/home');
  })(req, res, next)
})

// github auth 

app.get('/github/login', (req, res, next) => {
  return passport.authenticate('github', 
    { 
      scope: [ 'user:email' ],
      session: false
    }
  )(req, res, next)
});

app.get('/auth/github/cb',  (req, res, next) => {
  return passport.authenticate('github', 
    { 
      failureRedirect: '/login',
      session: false
    },
    (err, user, info) => {
      if (err || !user) {
        return res.redirect('/failure')
      }
      const token = AUTH.generateToken({ role: 'user', user: user.id, data: user});
      res.cookie('jwt', token, { httpOnly: true });
      return res.redirect('/home');

    } 
  )(req, res, next)
})

app.get(
  "/home",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json(req.user.claims)
    // res.send(`
    //   <head>
    //       <meta charset="UTF-8">
    //       <meta http-equiv="X-UA-Compatible" content="IE=edge">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <title>Login</title>
    //   </head>
    //   <h3>Bienvenido ${JSON.stringify(req.user.claims.data)}</h3>
    //   <a href="/logout">LogOut</a>
    // `);
  }
);

app.get('/failure', (req, res) => {
  res.send('autenticación fallida...');
});

app.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
})

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING localhost:${process.env.PORT}`)
})
