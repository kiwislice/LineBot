'use strict';

require('dotenv').config();
const express = require('express');
const linebot = require('linebot');

var bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

const linebotParser = bot.parser();

app.post('/linewebhook', linebotParser);


bot.on('message', function (event) {
  console.log(`received message: ${event.message.text}`);

  setTimeout(() => {
    bot.push(event.source.userId, `5秒`);
  }, 5000);

  event.reply(`重複:` + event.message.text).then(function (data) {
    // success
    console.log(`event.reply success ${data}`);
  }).catch(function (error) {
    // error
    console.log(`event.reply error ${error}`);
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


