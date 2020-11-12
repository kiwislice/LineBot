'use strict';

require('dotenv').config();
const express = require('express');
const linebot = require('linebot');

console.log(`
  channelId=${process.env.CHANNEL_ID}
  channelSecret=${process.env.CHANNEL_SECRET}
  channelAccessToken=${process.env.CHANNEL_ACCESS_TOKEN}
  port=${process.env.PORT}
`);

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

const UberPandaRemindService = require('./linebot/UberPandaRemindService');
const ErrorCmdService = require('./linebot/ErrorCmdService');
const UberPandaOrderService = require('./linebot/UberPandaOrderService');
const ImsScheduleService = require('./linebot/ImsScheduleService');
const AqiScheduleService = require('./linebot/AqiScheduleService');
const LeaveRoomService = require('./linebot/LeaveRoomService');
const ReplyService = require('./linebot/ReplyService');

const services = [UberPandaRemindService, UberPandaOrderService, ImsScheduleService,
  AqiScheduleService, LeaveRoomService, ReplyService, ErrorCmdService];
services.forEach(elm => elm.bot = bot);

bot.on('message', async function (event) {
  console.log(`received message: ${event.message.text}`);
  var source = JSON.stringify(event.source);
  console.log(`${source}`);

  var cmd = event.message.text.trim();
  for (var i = 0; i < services.length; i++) {
    // 有1個能處理就不需要其他
    if (await services[i].handle(cmd, event, bot))
      break;
  }

});


const CookieFilter = require('./web/CookieFilter');
const CrosFilter = require('./web/CrosFilter');
const HomeRouter = require('./web/HomeRouter');


// 額外加上根目錄的GET
app.use("/", CookieFilter, CrosFilter, HomeRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});


