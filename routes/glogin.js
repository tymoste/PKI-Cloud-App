const { google } = require('googleapis');
var express = require('express');
const { logging } = require('googleapis/build/src/apis/logging');
var router = express.Router();

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
            res.send(`Logged in: ${loggedUser} <img src="${result.data.picture}" height="23" width="23"> <a href="/logout"> Log me out </a>`);
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
            res.redirect('https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://pki-cloud-app.azurewebsites.net');
        }
    });
});

module.exports = router;
