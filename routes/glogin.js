const { google } = require('googleapis');
var express = require('express');
const { logging } = require('googleapis/build/src/apis/logging');
const { Client } = require("pg")
const dotenv = require("dotenv")
dotenv.config()
var router = express.Router();

const gitClientId = 'Ov23liVDoUk6114fGsAy';
const gitClientSecret = '3b98c6bf5b82dbe0ccef8b991b04222530a99e50';
    
/* GET home page. */
router.get('/', (req, res) => {
  if (!req.app.locals.authed) {
      // Generate an OAuth URL and redirect there
      const url = req.app.locals.oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: 'https://www.googleapis.com/auth/userinfo.profile'
      });
      console.log(url);
      res.redirect(url);
  } else {
      const oauth2 = google.oauth2({ version: 'v2', auth: req.app.locals.oAuth2Client });
      oauth2.userinfo.v2.me.get(function (err, result) {
        if (err) {
            console.log("Error:");
            console.log(err);
            res.send('Error retrieving user info');
        } else {
            const loggedUser = result.data.name;
            console.log(loggedUser);

            const connectDB = async() => {
                try{
                    const client = new Client({
                        user: process.env.PGUSER,
                        host: process.env.PGHOST,
                        database: process.env.PGDATABASE,
                        password: process.env.PGPASSWORD,
                        port: process.env.PGPORT
                    })
            
                    await client.connect()
                    const result2 = await client.query("SELECT * FROM users")
                    await client.end();
            
                }catch(error){
                    console.log(error);
                }
            }

            res.render("gitloginsuccess", {userData:result.data, qureyResult: result2.rows})
            // res.send(`Logged in: ${loggedUser} <img src="${result.data.picture}" height="23" width="23"> <a href="/glogin/logout"> Log me out </a>`);
        }
      });
  }
});

router.get('/auth/google/callback', function (req, res) {
  const code = req.query.code;
  if (code) {
      // Get an access token based on our OAuth code
      req.app.locals.oAuth2Client.getToken(code, function (err, tokens) {
          if (err) {
              console.log('Error authenticating');
              console.log(err);
              res.send('Error during authentication');
          } else {
              console.log('Successfully authenticated');
              req.app.locals.oAuth2Client.setCredentials(tokens);
              req.app.locals.authed = true;
              res.redirect('/glogin');
          }
      });
  }
});

router.get('/logout', (req, res) => {
    req.app.locals.oAuth2Client.revokeCredentials(function (err, result) {
        if (err) {
            console.error('Error revoking credentials:', err);
            res.send('Error during logout');
        } else {
            console.log('Credentials revoked successfully.');
            req.app.locals.authed = false; // Ustawienie authed na false po wylogowaniu
            
            // Wyczyść sesję przeglądarki
            req.session = null;
            
            // Wyślij żądanie do wylogowania się z Google
            res.redirect('/');
        }
    });
});

module.exports = router;
