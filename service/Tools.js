
const axios = require('axios');

/**取得訊息來源ID，類型可能是user|group|room */
function getSourceId(event) {
  if (event.source.type == 'user')
    return event.source.userId;
  if (event.source.type == 'group')
    return event.source.groupId;
  if (event.source.type == 'room')
    return event.source.roomId;
  return null;
}

/**取得user名稱 */
async function getUserName(event, bot) {
  var result = {};
  var url = `https://api.line.me/v2/bot/profile/{userId}`;
  if (event.source.type == 'group') {
    url = `https://api.line.me/v2/bot/group/{groupId}/member/{userId}`;
    url = url.replace('{groupId}', event.source.groupId);
  }
  else if (event.source.type == 'room') {
    url = `https://api.line.me/v2/bot/room/{roomId}/member/{userId}`;
    url = url.replace('{roomId}', event.source.roomId);
  }
  url = url.replace('{userId}', event.source.userId);

  await axios({
    method: 'get',
    url: url,
    headers: { 'Authorization': 'Bearer ' + bot.options.channelAccessToken },
  }).then(function (response) {
    result = response.data;
  });
  return result.displayName;
}

/**讓bot離開房間 */
async function leaveRoom(event, bot) {
  var url = null;
  if (event.source.type == 'group') {
    url = `https://api.line.me/v2/bot/group/{groupId}/leave`;
    url = url.replace('{groupId}', event.source.groupId);
  }
  else if (event.source.type == 'room') {
    url = `https://api.line.me/v2/bot/room/{roomId}/leave`;
    url = url.replace('{roomId}', event.source.roomId);
  }
  else return;

  await axios({
    method: 'post',
    url: url,
    headers: { 'Authorization': 'Bearer ' + bot.options.channelAccessToken },
  }).then(function (response) {
    console.log(response);
  });
}

/**取得bot名稱 */
async function getBotName(bot) {
  const url = `https://api.line.me/v2/bot/info`;
  var result = {};
  await axios({
    method: 'get',
    url: url,
    headers: { 'Authorization': 'Bearer ' + bot.options.channelAccessToken },
  }).then(function (response) {
    result = response.data;
  });
  return result.displayName;
}

/**取得bot本月到昨天截止已push數量 */
async function getBotPushCount(bot) {
  // const url = `https://api.line.me/v2/bot/message/delivery/push`;
  const url = `https://api.line.me/v2/bot/message/quota/consumption`;
  var result = {};
  await axios({
    method: 'get',
    url: url,//`${url}?date=${yesterday()}`,
    headers: { 'Authorization': 'Bearer ' + bot.options.channelAccessToken },
  }).then(function (response) {
    result = response.data;
  });
  return result.totalUsage;
}

/**
 * 取得昨天日期文字：EX:20201118
 */
function yesterday() {
  const MS_OF_DAY = 1000 * 60 * 60 * 24;
  var d = new Date(Date.now() - MS_OF_DAY);
  return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
}

/**
 * 取得日期文字：EX:2020-11-18 11:12:13
 * @param {Date} d
 */
function toYMDHMS(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${toHMS(d)}`;
}

/**
 * 取得日期文字：EX:11:12:13
 * @param {Date} d
 */
function toHMS(d) {
  var h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  var m = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
  var s = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
  return `${h}:${m}:${s}`;
}

/**
 * 讓console顯示彩色文字
 * @param {string} text 文字
 * @param {string} color red|green|yellow|blue|purple|cyan
 * @returns {string} 附帶色碼的文字
 */
function colorText(text, color) {
  var c = 37;
  if (color == 'red')
    c = 31;
  else if (color == 'green')
    c = 32;
  else if (color == 'yellow')
    c = 33;
  else if (color == 'blue')
    c = 34;
  else if (color == 'purple')
    c = 35;
  else if (color == 'cyan')
    c = 36;
  return "\u001b[1;" + c + "m" + text + "\u001b[0m";
}

module.exports = {
  getSourceId, getUserName, leaveRoom, getBotName, getBotPushCount, colorText, toYMDHMS, toHMS
};


