var feed = require('feed-read'),
    schedule = require('node-schedule');

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

function processArticle(article) {
    if (!(article.link in alreadySeen) && !initialLoad) {
        tellThePeople(article);
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
    feed('http://feeds.feedburner.com/publici_rss', feedLoaded);
}

function init () {
    var rule = new schedule.RecurrenceRule();
    rule.minute = [2,17,32,47];

    var j = schedule.scheduleJob(rule, retrieveFeed);
}

init();
