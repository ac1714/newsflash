var http = require('http')
  , Promise = require('bluebird');

var nytimes_key = '9f827b34ac633dc815206c8dab6ff00b:3:56570661';

var options = {
  host: "api.nytimes.com",
  path: "/svc/news/v3/content/nyt/all.json?&limit=50&api-key=" + nytimes_key
};
// ====================
// To pull more than 50 articles...
// http://api.nytimes.com/svc/news/v3/content/nyt/all/.json?&limit=50&offset=0
// http://api.nytimes.com/svc/news/v3/content/nyt/all/.json?&limit=50&offset=50
// http://api.nytimes.com/svc/news/v3/content/nyt/all/.json?&limit=50&offset=100


// Defines keywords as the split values of titles in NYTimes Breaking News firehose
exports.getKeywords = function() {
  return new Promise(function(resolve, reject) {
    // establish connection with NYTimes API and pull down Breaking News
    http.get(options, function(res) {
      var news = ""
        , count = 0
        , title = ""
        , keywords = []
        , titleCollection = []
        , filteredKeywords = []
        , junkwords = ["", "a", "an", "and", "at", "of", "in", "on", "the", "was"];

      res.on('data', function(chunk) {
        news += chunk;
      });

      res.on('end', function() {
        if (res.statusCode == 200) {
          var pretty_news = JSON.parse(news)
            , articles    = pretty_news.results;
            console.log(articles)
        }

        console.log("Pulling down " + articles.length + " NYTimes articles...")

        articles.forEach(function(e,i) {
          // pluck the titles from each article
          title = articles[i].title.trim().toLowerCase().split(' ')
          titleCollection.push(articles[i].title.trim().toLowerCase().split(' '));
          // remove duplicates
          keywords = titleCollection.concat.apply([], titleCollection);
          // remove junk words
          keywords.map(function(word) {
            junkwords.forEach(function(junk) {
              if (word === junk) {
                keywords.splice(keywords.indexOf(word),1);
                count += 1;
                // console.log("deleted ", word);
              };
            });
          });
          console.log("Deleted " + count + " junkword(s).")
          console.log("Pulled " + keywords.length + " keyword(s).")
          resolve(keywords);
          console.log("++Keywords is " + keywords.length + " long in nytimes_firehose.js++")
        });
      });
    });
  });
}

// curl http://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=9f827b34ac633dc815206c8dab6ff00b:3:56570661 | underscore print -o store.js