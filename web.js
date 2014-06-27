var express = require('express'),
    logfmt = require('logfmt');

function gotATestYo(req, res) {
    console.log('got a test yo:',req.method,req.url,req.body);
    res.send('Thanks!');
}

function gotAYo(req, res) {
    console.log('got a yo:',req.method,req.url,req.body);
    res.send('Thanks!');
}

function init () {
    var app = express();

    app.use(logfmt.requestLogger());

    app.get('/got-a-yo', gotAYo);
    app.get('/test-yo', gotATestYo);

    var port = Number(process.env.PORT || 5000);
    app.listen(port, function() {
        console.log("Listening on " + port);
    });
}

init();
