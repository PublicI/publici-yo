var express = require('express'),
    logfmt = require('logfmt'),
    feed = require('feed-read'),
    _ = require('lodash'),
    request = require('request');

var alreadySeen = {};
var initialLoad = true;
var yosReceived = [];

function gotAYo(req, res) {
    console.log('got a yo:',req.param('username'));
    yosReceived.push({
        url: req.url,
        date: new Date()
    });

    yoThePerson(req.param('username'));

    res.send('Thanks!');
}

function yoResult (err, httpResponse, body) {
    if (err) {
        return console.error('yo failed:', err);
    }

    console.log('yo success:', body);
}

function yoThePeople(url) {
    console.log('sending yo');

    var r = request.post('http://api.justyo.co/yoall/', yoResult);
    var form = r.form();
    form.append('api_token', process.env.YO_TOKEN);
    form.append('link', url);
}

function yoThePerson(user) {
    console.log('sending yo');

    var r = request.post('http://api.justyo.co/yo/', yoResult);
    var form = r.form();
    form.append('api_token', process.env.YO_TOKEN);
    form.append('username', user);
}

function retrieveFeed(req, res) {
    console.log('checking if yo');
    feed('http://feeds.feedburner.com/publici_rss',function (err, articles) {
        if (err) {
            console.error('feed load failed:', err);
        }

        articles.forEach(function (article) {
            console.log(article);
            if (!(article.id in alreadySeen) && !initialLoad) {
                yoThePeople(article.link);
            }


            alreadySeen[article.id] = true;
        });

        var feed = '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<rss version="2.0">' +
            '<channel>' +
            '<title>Publici Yos</title>' +
            '<description>This is a feed of some yos, yo</description>' +
            '<link>http://www.publicintegrity.org/</link>' +
            '<lastBuildDate>' + (new Date()).toUTCString() +  '</lastBuildDate>' +
            '<pubDate>' + (new Date()).toUTCString() +  '</pubDate>' +
            '<ttl>1800</ttl>' +
            '';

        yosReceived.forEach(function (yo) {
            feed += '<item>' +
                ' <title>' + yo.url + '</title>' +
                ' <pubDate>' + yo.date.toUTCString() +  '</pubDate>' +
                ' <guid isPermaLink=\"false\">' + encodeURIComponent(yo.url + "&") + 'when=' + encodeURIComponent(yo.date.toUTCString()) + '</guid>' +
                '</item>';
        });

        feed += '' +
            '</channel>' +
            '</rss>';

        res.send(feed);

        initialLoad = false;
    });
}

function init () {
    var app = express();

    // app.use(logfmt.requestLogger());

    app.get('/got-a-yo', gotAYo);
    app.get('/check-if-yo', retrieveFeed);

    var port = Number(process.env.PORT || 5000);
    app.listen(port, function() {
        console.log('Listening on ' + port);
    });
}

init();
