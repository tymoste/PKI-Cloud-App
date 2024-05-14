const { google } = require('googleapis');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (!req.app.locals.authed) {
      // Generate an OAuth URL and redirect there
      const url = req.app.locals.oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: 'https://www.googleapis.com/auth/gmail.readonly'
      });
      console.log(url)
      res.redirect(url);
  } else {
      const gmail = google.gmail({ version: 'v1', auth: req.app.locals.oAuth2Client });
      gmail.users.labels.list({
          userId: 'me',
      }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const labels = res.data.labels;
          if (labels.length) {
              console.log('Labels:');
              labels.forEach((label) => {
                  console.log(`- ${label.name}`);
              });
          } else {
              console.log('No labels found.');
          }
      });
      res.send('Logged in')
  }
})

router.get('/auth/google/callback', function (req, res) {
  const code = req.query.code
  if (code) {
      // Get an access token based on our OAuth code
      req.app.locals.oAuth2Client.getToken(code, function (err, tokens) {
          if (err) {
              console.log('Error authenticating')
              console.log(err);
          } else {
              console.log('Successfully authenticated');
              req.app.locals.oAuth2Client.setCredentials(tokens);
              req.app.locals.authed = true;
              res.redirect('/')
          }
      });
  }
});

module.exports = router;
