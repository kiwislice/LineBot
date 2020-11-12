

const linebot = require('linebot');

// 讀取環境變數
function readEnvSettings() {
  var settings = [];
  for (var i = 1; i < 10; i++) {
    var o = {};
    o.path = '/linewebhook' + i;
    o.channelId = process.env['CHANNEL_ID_' + i];
    o.channelSecret = process.env['CHANNEL_SECRET_' + i];
    o.channelAccessToken = process.env['CHANNEL_ACCESS_TOKEN_' + i];

    if (o.channelId && o.channelSecret && o.channelAccessToken) {
      console.log(`
        path=${o.path}
        channelId=${o.channelId}
        channelSecret=${o.channelSecret}
        channelAccessToken=${o.channelAccessToken}
      `);
      settings.push(o);
    }
  }
  return settings;
}

// 針對一組設定產生對應bot
function createBot(setting) {
  var bot = linebot({
    channelId: setting.channelId,
    channelSecret: setting.channelSecret,
    channelAccessToken: setting.channelAccessToken,
  });
  bot.linewebhookPath = setting.path;
  return bot;
}


function botWrap(bot) {
  console.log(`
    bot.channelId=${bot.options.channelId}
    bot.channelSecret=${bot.options.channelSecret}
    bot.channelAccessToken=${bot.options.channelAccessToken}
  `);

  bot.options.channelAccessToken = 'aaa';
  bot.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + bot.options.channelAccessToken
  };

  console.log(`
    bot.channelId=${bot.options.channelId}
    bot.channelSecret=${bot.options.channelSecret}
    bot.channelAccessToken=${bot.options.channelAccessToken}
  `);

  return bot;
}




// 直接讀取所有環境變數建立bots
var settings = readEnvSettings();
var bots = settings.map(setting => createBot(setting));
// 製作所有bots的單獨代理
var botProxy = {
  bots: bots,
  // push時就是全部bot都推
  push: function (to, msg) {
    bots.forEach(bot => bot.push(to, msg));
  },
};

const UberPandaRemindService = require('../linebot/UberPandaRemindService');
const ErrorCmdService = require('../linebot/ErrorCmdService');
const UberPandaOrderService = require('../linebot/UberPandaOrderService');
const ImsScheduleService = require('../linebot/ImsScheduleService');
const AqiScheduleService = require('../linebot/AqiScheduleService');
const LeaveRoomService = require('../linebot/LeaveRoomService');
const ReplyService = require('../linebot/ReplyService');
const TestScheduleService = require('../linebot/TestScheduleService');


const services = [UberPandaRemindService, UberPandaOrderService, ImsScheduleService,
  AqiScheduleService, LeaveRoomService, ReplyService, TestScheduleService, ErrorCmdService];
// 原本塞給各服務的bot改為代理
services.forEach(elm => elm.bot = botProxy);


async function botOnMessage(event) {
  console.log(`received message: ${event.message.text}`);
  var source = JSON.stringify(event.source);
  console.log(`${source}`);

  var cmd = event.message.text.trim();
  for (var i = 0; i < services.length; i++) {
    // 有1個能處理就不需要其他
    if (await services[i].handle(cmd, event))
      break;
  }
}


module.exports = function (app) {
  bots.forEach(bot => {
    bot.on('message', botOnMessage);
    var linebotParser = bot.parser();
    app.post(bot.linewebhookPath, linebotParser);
  });
};


