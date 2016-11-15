# twitter_webtask

This is a script that uses webtask.io's functionality to return a list of tweets containing the term that the user searched for.

# Working model 
[js bin](http://jsbin.com/futiluq/1/edit?output)

The link to my [version](https://wt-aswani-pranjal-gmail-com-0.run.webtask.io/o_twitter_webtask?webtask_no_cache=1), just add `&name=query` at the end. 

# steps to configure:

**STEP 1:**
Clone (`git clone`) and install (`npm install`) the dependencies. 

**STEP 2:**
create a file named `data/config.json` and add the following in it:
```
{
"CONSUMER_KEY" :  "<your consumer key>"
"CONSUMER_SECRET" : "<your consumer secret>"
"ACCESS_TOKEN" : "<your access token>"
"ACCESS_TOKEN_SECRET" : "<your access token secret>"
}
```
You can get them [here](https://apps.twitter.com/)

**STEP 3:**
Download and configure the [``Webtask cli``](https://webtask.io/cli) and [``Webtask bundle``](https://github.com/auth0/webtask-bundle)

**STEP 4:**
Webtask.io dosen't contain `twitter` module used here, we will have to bundle it.
```
wt-bundle --watch --output out_twitter_webtask.js twitter_webtask.js
```

**STEP 5:**
run:
```
wt create out_twitter_webtask.js
```

**STEP 6:**
For the term that you have to search, you will have to add the term ```&name=<search term>``` to the end of the url that is given by STEP 5.

Go to the generated url.
