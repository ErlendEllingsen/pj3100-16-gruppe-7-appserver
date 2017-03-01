var fs = require('fs');
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var http = require('http');
var colors = require('colors');
var router = express.Router(); 

//--- APPLICATION SETUP ---
var http_port = 80;
var https_port = 443;
var devmode = false;

if (process.argv[2] == 'dev') {
    http_port = 8080;
    https_port = 8081;
    devmode = true;
}

//--- EXPRESS CORE SETUP ---
//Hide software from potential attackers.
app.disable('x-powered-by');

//Use bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// START THE SERVER
// =============================================================================
http.createServer(app).listen(http_port);

//PRODUCTION - ENABLE SSL 
if (!devmode) {

    // LOAD SSL
    var privateKey = fs.readFileSync( '/etc/letsencrypt/live/dnbsmart.jungleflake.com/privkey.pem' );
    var certificate = fs.readFileSync( '/etc/letsencrypt/live/dnbsmart.jungleflake.com/cert.pem' );


    // START THE SERVER
    // =============================================================================

    https.createServer({
        key: privateKey,
        cert: certificate 
    }, app).listen(https_port);

    //end production launch configuration
}


console.log(colors.yellow('CORE') + ' Enabled ' + colors.bold('HTTP') + ' at ' + http_port);

/**
 * BEGIN
 */

app.use('/', router);