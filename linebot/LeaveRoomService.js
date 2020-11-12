var service = { bot: null };

const SERVICE_ID = `LeaveRoomService`;

const tools = require('../service/Tools');

service.handle = async function (cmd, event) {
  var sourceId = tools.getSourceId(event);
  if (sourceId == null) return false;

  if (cmd === "助理，你被開除了") {
    event.reply("好，我走！！！");
    setTimeout(async () => {
      await tools.leaveRoom(event);
    }, 1000);
    return true;
  }
  return false;
};


module.exports = service;
