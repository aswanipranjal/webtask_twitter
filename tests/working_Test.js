//the url passed here works and returns a html body with a lot of unwanted data.
//i wanted to use the twitter api so that i get the data in json format


var request = require('request')

module.exports = function (cb){
    request('https://twitter.com/search?q=%23irshaad&src=savs',function(error, response, body)
    {
    if (!error && response.statusCode==200){
        cb(null, body)
        }
    else {
        cb(null, 'nothin')
        } 
    })
}
