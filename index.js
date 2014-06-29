var express = require('express'),
    logfmt = require('logfmt'),
    feed = require('feed-read');

var alreadySeen = {};
var initialLoad = true;
var yosReceived = [];

function gotAYo(req, res) {
    console.log('got a yo:',req.method,req.url);
    yosReceived.push({
        url: req.url,
        date: new Date()
    });
    res.send('Thanks!');
}

function yoResult (err, httpResponse, body) {
    if (err) {
        return console.error('yo failed:', err);
    }

    console.log('yo success:', body);
}

function tellThePeople(article) {
    console.log('sending yo');

    var r = request.post('http://api.justyo.co/yoall/', yoResult);
    var form = r.form();
    form.append('api_token', process.env.YO_TOKEN);
}


function retrieveFeed(req, res) {
    console.log('checking if yo');
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

        var feed = '<?xml version="1.0" encoding="UTF-8" ?>' +
            '<rss version="2.0">' +
            '<channel>' +
            '<title>Publici Yos</title>' +
            '<description>This is an example of an RSS feed</description>' +
            '<link>http://www.example.com/main.html</link>' +
            '<lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000 </lastBuildDate>' +
            '<pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>' +
            '<ttl>1800</ttl>' +
            '';

        yosReceived.forEach(function (yo) {
            feed += '<item>' +
                ' <title>' + yo.url + '</title>' +
                ' <pubDate>' + yo.date.toUTCString() +  '</pubDate>' +
                ' <guid>' + yo.date.toUTCString()+ yo.url +  '</guid>' +
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
