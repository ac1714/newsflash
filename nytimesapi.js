var http       = require('http')
  , Promise    = require('bluebird');

// nytimes api
var nytimes_key = '9f827b34ac633dc815206c8dab6ff00b:3:56570661'
  , options = {
      host: "api.nytimes.com",
      path: "/svc/news/v3/content/all/all.json?&limit=50&api-key=" + nytimes_key
    };

// alchemy api
var AlchemyAPI = require('./alchemyapi')
  , alchemyapi = new AlchemyAPI();


exports.pullArticles = function(callback) {
  // establish connection with NYTimes API
  http.get(options, function(res) {
    var data     = ""
      , articles = [];

    res.on('data', function(chunk) {
      data += chunk;
    });

    // save all the articles in the newswire
    res.on('end', function() {
      if (res.statusCode === 200) {
        var pretty_news = JSON.parse(data)
          , articles    = pretty_news.results;
      }

      console.log("Pulling down " + articles.length + " NYTimes articles...")

      callback(articles);
    });
  });
};

exports.getKeywords = function() {
  return new Promise(function(resolve, reject) {
    exports.pullArticles(function(articles) {
      var content  = ""
        , cauldron = {}
        , keywords = [];

      articles.forEach(function(article) {
        // pluck the abstracts from each article
        abstract = article.abstract;
        content += abstract + " ";
      });

      alchemyapi.keywords('text', content, { 'sentiment':1 }, function(response) {
        cauldron['keywords'] = { text:content, response:JSON.stringify(response,null,4), results:response['keywords'] };

        cauldron.keywords.results.forEach(function(element) {
          for(var key in element) {
            if (key === 'content') {
              keywords.push(element[key]);
            }
          }
        });
        resolve(keywords);
      });
    });
  });
};