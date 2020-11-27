

const SERVICE_ID = `LineNotifyService`;

var service = { bot: null };

const axios = require('axios');
const qs = require('qs');
const flex = require('../service/FlexMeaaageRandemCard');


/**虛擬助理->測試群 */
const token = 'Uub16Kg4EpbCZTMAoVsktLcmNtaa4lNCgzBpGilSBPJ';



/**
 * 發送訊息
 * @param {string} msg 訊息
 * @param {Array} tokens 
 */
async function sendNotify(text, tokens = []) {
  tokens.map(token => {
    axios({
      method: 'post',
      url: 'https://notify-api.line.me/api/notify',
      headers: { 'Authorization': 'Bearer ' + token },
      data: `message=${text}`,
    }).then(function (response) {
      result = response.data;
    }).catch(function (error) {
      console.log(error);
    });
  });
}


/**
 * 發送訊息給開發人員
 * @param {string} msg 訊息
 */
function sendNotifyToDev(text) {
  axios({
    method: 'post',
    url: 'https://notify-api.line.me/api/notify',
    headers: { 'Authorization': 'Bearer ' + token },
    data: `message=${text}`,
  }).then(function (response) {
    result = response.data;
  }).catch(function (error) {
    console.log(error);
  });
}


service.handle = function (cmd, event, currentBot) {
  if (cmd.match(/^notify:(.+)/)) {
    var text = cmd.match(/^notify:(.+)/)[1];
    console.log(text);
    if (text)
      sendNotify(text, [token]);
    // 只有文字、圖片、貼圖
    // sendTextNotify(flex.asMenu(['雷達回波', '空氣品質', '天氣警特報']), [token]);
    return true;
  }
  return false;
};

service.sendNotify = sendNotify;
service.sendNotifyToDev = sendNotifyToDev;

module.exports = service;






