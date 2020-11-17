
const axios = require('axios');

function getSourceId(event) {
  if (event.source.type == 'user')
    return event.source.userId;
  if (event.source.type == 'group')
    return event.source.groupId;
  if (event.source.type == 'room')
    return event.source.roomId;
  return null;
}

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

async function getBotPushCount(bot) {
  const url = `https://api.line.me/v2/bot/message/delivery/push`;
  var result = {};
  await axios({
    method: 'get',
    url: `${url}?date=${yesterday()}`,
    headers: { 'Authorization': 'Bearer ' + bot.options.channelAccessToken },
  }).then(function (response) {
    result = response.data;
  });
  return result.success;
}

function yesterday() {
  const MS_OF_DAY = 1000 * 60 * 60 * 24;
  var d = new Date(Date.now() - MS_OF_DAY);
  return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
}

module.exports = {
  getSourceId, getUserName, leaveRoom, getBotName, getBotPushCount,
};


