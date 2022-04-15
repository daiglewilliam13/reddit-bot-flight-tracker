require('dotenv').config();

const Snoowrap = require('snoowrap');
const { CommentStream } = require('snoostorm');

const r = new Snoowrap({
    userAgent: 'muskflighttrackerbot',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

const stream = new CommentStream(r, {
    subreddit: "testingground4bots",
    limit: 10,
    pollTime: 10000
});

stream.on("item", comment => {
    console.log(comment)
})