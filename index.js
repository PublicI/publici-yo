var express = require("express"),
    logfmt = require("logfmt"),
    feed = require("feed-read"),
    schedule = require('node-schedule');

var alreadySeen = {};
var initialLoad = true;

function gotATestYo(req, res) {
    console.log('got a test yo:',req.method,req.url,req.body);
    res.send('Thanks!');
}

function gotAYo(req, res) {
    console.log('got a yo:',req.method,req.url,req.body);
    res.send('Thanks!');
}

function yoResult (err, httpResponse, body) {
    if (err) {
        return console.error('yo failed:', err);
    }

    console.log('yo success:', body);
}

function tellThePeople(article) {
    console.log(article);
    // http://api.justyo.co/yoall/
    var r = request.post('http://publici-yo.herokuapp.com/test-yo', yoResult);
    var form = r.form();
    form.append('api_token', process.env.YO_TOKEN);
}

function processArticle(article) {
    if (!(article.link in alreadySeen) && !initialLoad) {
        tellThePeople(article);
    }
    else {
        console.log(article);
    }
    alreadySeen[article.link] = true;
}

function feedLoaded(err, articles) {
    if (err) {
        console.error('feed load failed:', err);
    }

    articles.forEach(processArticle);

    initialLoad = false;
}

function retrieveFeed() {
    feed("http://feeds.feedburner.com/publici_rss", feedLoaded);
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

    var rule = new schedule.RecurrenceRule();
    rule.minute = [2,17,30,32,47];

    var j = schedule.scheduleJob(rule, retrieveFeed);
}

init();
