
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

async function getUserName(event) {
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
    headers: { 'Authorization': 'Bearer ' + process.env.CHANNEL_ACCESS_TOKEN },
  }).then(function (response) {
    result = response.data;
  });
  return result.displayName;
}


module.exports = {
  getSourceId, getUserName,
};


