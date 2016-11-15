# twitter_webtask

This is a script that uses webtask.io's functionality to return a list of tweets containing the term that the user searched for.

A working model can be found here: [js bin](http://jsbin.com/futiluq/1/edit?output)

The link to my [version](https://wt-aswani-pranjal-gmail-com-0.run.webtask.io/o_twitter_webtask?webtask_no_cache=1), just add '&name=query' at the end. 

**STEP 1:**
create a file named `data/config.json` and add the following in it:
```
{
"CONSUMER_KEY" :  "<your consumer key>"
"CONSUMER_SECRET" : "<your consumer secret>"
"ACCESS_TOKEN" : "<your access token>"
"ACCESS_TOKEN_SECRET" : "<your access token secret>"
}
```

**STEP 2:**
The script requires `node-twitter` module. If you have it installed, goto STEP 3. Else, it can be dowloaded from here [Twitter](https://www.npmjs.com/package/twitter)

**STEP 3:**
After that, as webtask.io dosen't contain `twitter` module that we use, we will have to bundle it.
```
wt-bundle --watch --output out_twitter_webtask.js twitter_webtask.js
```

**STEP 4:**
then finally, run:
```
wt create out_twitter_webtask.js
```
**STEP 5:**
for the term that you have to search, you will have to add the term ```&query=<search term>``` to the end of the url that is given by STEP 4.

**STEP 6:**
go to the url that is created after doing what is said in STEP 4 and 5.

you will have an array of 15 tweets. Or an error if you didn't folllow the steps properly. 

