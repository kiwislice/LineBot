

const linebot = require('linebot');
const tools = require('../service/Tools');
const LineNotifyService = require('../linenotify/LineNotifyService');


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


// 直接讀取所有環境變數建立bots
var settings = readEnvSettings();
var bots = settings.map(setting => createBot(setting));
// 製作所有bots的單獨代理
var botProxy = {
  bots: bots,
  // push時就是全部bot都推
  push: function (to, msg) {
    bots.forEach(bot => {
      bot.push(to, msg);
      LineNotifyService.sendNotifyToDev(`${bot.linewebhookPath} push ${JSON.stringify(msg)}`);
    });
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
const InfoService = require('../linebot/InfoService');
const WeatherService = require('../linebot/WeatherService');




const services = [UberPandaRemindService, UberPandaOrderService, ImsScheduleService,
  AqiScheduleService, LeaveRoomService, ReplyService, TestScheduleService, InfoService,
  WeatherService, LineNotifyService, ErrorCmdService];
// 原本塞給各服務的bot改為代理
services.forEach(elm => elm.bot = botProxy);

/**bot OnMessage function工廠 */
function botOnMessageFactory(bot) {
  return function (event) {
    botOnMessage(event, bot);
  };
}

async function botOnMessage(event, bot) {
  var rm = `${bot.linewebhookPath} received message: ${event.message.text}`;
  console.log(tools.colorText(rm));
  var source = JSON.stringify(event.source);
  console.log(tools.colorText(`source=${source}`));

  // console.log(tools.colorText(`event=${JSON.stringify(event)}`, 'green'));
  if (event.message.type == 'text' && event.message.text) { // 文字
    var cmd = event.message.text.trim();
    for (var i = 0; i < services.length; i++) {
      // 有1個能處理就不需要其他
      if (await services[i].handle(cmd, event, bot))
        break;
    }
  } else if (event.message.type == 'sticker') { // 貼圖
    // 範例
    // {
    //   "type": "message",
    //   "replyToken": "ca5ec333daad4bfc8c193c1b2c04fc5f",
    //   "source": {
    //     "userId": "Uc5452fe54552f331fa5182999ad6db1c",
    //     "type": "user"
    //   },
    //   "timestamp": 1605748730104,
    //   "mode": "active",
    //   "message": {
    //     "type": "sticker",
    //     "id": "13055684833831",
    //     "stickerId": "1192266",
    //     "packageId": "1027905",
    //     "stickerResourceType": "STATIC"
    //   }
    // }
  } else if (event.message.type == 'image') { // 圖片
    // 範例
    // {
    //   "type": "message",
    //   "replyToken": "63e167caa74146179ea5799282f00d7a",
    //   "source": {
    //     "userId": "Uc5452fe54552f331fa5182999ad6db1c",
    //     "type": "user"
    //   },
    //   "timestamp": 1605748883442,
    //   "mode": "active",
    //   "message": {
    //     "type": "image",
    //     "id": "13055695123160",
    //     "contentProvider": {
    //       "type": "line"
    //     }
    //   }
    // }
  }
}


module.exports = function (app) {
  bots.forEach(bot => {
    bot.on('message', botOnMessageFactory(bot));
    var linebotParser = bot.parser();
    app.post(bot.linewebhookPath, linebotParser);

  });
};


