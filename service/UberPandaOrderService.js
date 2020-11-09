
var service = { bot: null };

const SERVICE_ID = `UberPandaOrderService`;
const tools = require('./Tools');

var cache = {};

service.handle = async function (cmd, event, bot) {
    var sourceId = tools.getSourceId(event);
    if (sourceId == null)
        return false;
    if (cmd === "開始點餐") {
        cache[sourceId] = { enable: true, list: {} };
        event.reply(`以下開放點餐，餐點名稱前面請加/\n範例：/雞肉飯`);
        return true;
    } else if (cache[sourceId] && cmd === "結束點餐") {
        cache[sourceId].enable = false;
        event.reply(`點餐截止`);
        return true;
    } else if (cache[sourceId] && cache[sourceId].enable && cmd.startsWith("/")) {
        var data = cache[sourceId].list[event.source.userId] || {};
        var item = cmd.replace(/^\/+/, '');
        data.item = item;
        data.username = data.username || await tools.getUserName(event);
        cache[sourceId].list[event.source.userId] = data;
        event.reply(`接受點餐：${data.username} ${data.item}`);
        return true;
    } else if (cache[sourceId] && cmd === "清單") {
        var list = cache[sourceId].list;
        var msg = `已接受清單：\n`;
        for (var userId in list) {
            msg += `${list[userId].username}: ${list[userId].item}\n`;
        }
        event.reply(msg);
        return true;
    }
    return false;
};

module.exports = service;


