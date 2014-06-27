var express = require('express'),
    logfmt = require('logfmt'),
    feed = require('feed-read');

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
    // http://api.justyo.co/yoall/
    var r = request.post('http://publici-yo.herokuapp.com/test-yo', yoResult);
    var form = r.form();
    form.append('api_token', process.env.YO_TOKEN);
}


function retrieveFeed(req, res) {
    feed('http://feeds.feedburner.com/publici_rss',function (err, articles) {
        if (err) {
            console.error('feed load failed:', err);
        }

        var isNew = false;

        articles.forEach(function (article) {
            if (!(article.link in alreadySeen) && !initialLoad) {
                isNew = true;
            }
            alreadySeen[article.link] = true;
        });

        if (isNew) {
            tellThePeople(article);
        }

        res.send('<?xml version="1.0" encoding="UTF-8" ?>' +
            '<rss version="2.0">' +
            '<channel>' +
            '<title>RSS Title</title>' +
            '<description>This is an example of an RSS feed</description>' +
            '<link>http://www.example.com/main.html</link>' +
            '<lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000 </lastBuildDate>' +
            '<pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>' +
            '<ttl>1800</ttl>' +
            '' +
            '<item>' +
            ' <title>Example entry</title>' +
            ' <description>Here is some text containing an interesting description.</description>' +
            ' <link>http://www.example.com/blog/post/1</link>' +
            ' <guid>7bd204c6-1655-4c27-aeee-53f933c5395f</guid>' +
            ' <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>' +
            '</item>' +
            '' +
            '</channel>' +
            '</rss>');

        initialLoad = false;
    });
}

function init () {
    var app = express();

    app.use(logfmt.requestLogger());

    app.get('/got-a-yo', gotAYo);
    app.get('/test-yo', gotATestYo);
    app.get('/check-if-yo', retrieveFeed);

    var port = Number(process.env.PORT || 5000);
    app.listen(port, function() {
        console.log("Listening on " + port);
    });
}

init();
