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

const UberPandaRemindService = require('./service/UberPandaRemindService');
const ErrorCmdService = require('./service/ErrorCmdService');
const UberPandaOrderService = require('./service/UberPandaOrderService');

const services = [UberPandaRemindService, UberPandaOrderService, ErrorCmdService,];
services.forEach(elm => elm.bot = bot);

bot.on('message', function (event) {
  console.log(`received message: ${event.message.text}`);
  var source = JSON.stringify(event.source);
  console.log(`${source}`);

  var cmd = event.message.text.trim();
  for (var i = 0; i < services.length; i++) {
    // 有1個能處理就不需要其他
    if (services[i].handle(cmd, event, bot))
      break;
  }

});

console.log(`
  channelId=${process.env.CHANNEL_ID}
  channelSecret=${process.env.CHANNEL_SECRET}
  channelAccessToken=${process.env.CHANNEL_ACCESS_TOKEN}
  port=${process.env.PORT}
`);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


