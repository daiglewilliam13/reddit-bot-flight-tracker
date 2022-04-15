require('dotenv').config();

const Snoowrap = require('snoowrap');
const { CommentStream } = require('snoostorm');

const r = new Snoowrap({
    userAgent: process.env.REDDIT_USERAGENT,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});



r.getSubreddit('whereiselon')
.submitSelfpost({title:'test post please ignore', text: "hello world"})
.sticky()
.approve()
.assignFlair({text: 'test flair hello'})
.reply('test comment');