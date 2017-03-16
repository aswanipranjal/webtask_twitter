var Twitter = require('twitter');

var json = require('data/config.json');

var client = new Twitter ({
  consumer_key: json.CONSUMER_KEY,
  consumer_secret: json.CONSUMER_SECRET,
  access_token_key: json.ACCESS_TOKEN,
  access_token_secret: json.ACCESS_TOKEN_SECRET
});

//jsdnjd
function store_tweets(query, cb) {
    client.get('search/tweets', {q: query}, function(error, tweets, response) {
        if(!error) {
            cb(tweets);
        }
        else {
            cb(error);
        }
    });
}

module.exports = function(context, cb) {
    var query = context.query.name;
    if(!query) {
       cb("enter search term as query=<term> in the url");
       return;
    }
    store_tweets(query, function(data) {
        var data_list = new Object;
        for (var i=0; i<data.statuses.length; i++) {
            data_list["tweet "+(i+1)] = data.statuses[i].text;
        }
        cb(null, data_list);
    });
}
