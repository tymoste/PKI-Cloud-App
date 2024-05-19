const { google } = require('googleapis');
var express = require('express');
const { logging } = require('googleapis/build/src/apis/logging');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.render("glogin", {})
})

module.exports = router;
