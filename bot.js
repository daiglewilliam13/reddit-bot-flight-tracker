require('dotenv').config();
const Snoowrap = require('snoowrap');

const r = new Snoowrap({
    userAgent: process.env.REDDIT_USERAGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

const needle = require('needle');
const userId = "1268280560599867392";
const url = `https://api.twitter.com/2/users/${userId}/tweets`;

const bearerToken = process.env.BEARER_TOKEN;

let mostRecentTweet = "1514725897663774737"
const getUserTweets = async () => {
    let userTweets = [];

    // we request the author_id expansion so that we can print out the user name later
    let params = {
        "max_results": 10,
        "tweet.fields": "id",
        "expansions": "author_id,in_reply_to_user_id,attachments.media_keys,referenced_tweets.id",
        "exclude": "replies,retweets",
        "since_id": mostRecentTweet
    }

    const options = {
        headers: {
            "User-Agent": 'flight tracker bot v1.0',
            "authorization": `Bearer ${bearerToken}`
        }
    }

    let hasNextPage = true;
    let nextToken = null;
    let userName;
    console.log("Retrieving Tweets...");
    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            userName = resp.includes.users[0].username;
            if (resp.data) {
                userTweets.push.apply(userTweets, resp.data);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }


    mostRecentTweet = userTweets[0] ? userTweets[0].id.toString() : mostRecentTweet;
    console.log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${userId})!`);
    console.log(mostRecentTweet)
    return userTweets

}

const getPage = async (params, options, nextToken) => {
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', url, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}

const postNewTweet = (tweetObj) => {
    tweetObj.map((obj) => {
        console.log(obj)
        let url = "https://twitter.com/ElonJet/status/" + obj.id
        if (!obj.in_reply_to_user_id) {

            let title = obj.text;
            r.getSubreddit('whereiselon').submitLink({
                title: `${title} ID:${obj.id}`,
                url: url,
            })
                .approve()
        } else {
            setTimeout(function () {
                findPostAndReply(obj);
            }, 20000)
        }
    })
}

const findPostAndReply = (obj) => {
    const searchParam = obj.referenced_tweets[0].id
    r.getSubreddit('whereiselon')
        .search({ query: `ID` })
        .then((foundPosts) => {
            foundPosts.forEach((post) => {
                let isPost = post.title.indexOf(searchParam)
                if (isPost) {
                    r.getSubmission(post.id).reply(obj.text)
                    console.log('comment submitted')
                }
            })
        })
}

setInterval(async () => {
    let tweets = await getUserTweets();
    postNewTweet(tweets.reverse());
}, 1000)