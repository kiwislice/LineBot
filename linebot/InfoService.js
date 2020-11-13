

// bot狀態相關服務

var service = { bot: null };

const tools = require('../service/Tools');

service.handle = async function (cmd, event) {
    if (cmd == 'pushCount') {
        var msgAr = await Promise.all(service.bot.bots.map(async (b) => {
            var count = await tools.getBotPushCount(b);
            var name = await tools.getBotName(b);
            return `${name}已push數量：${count}\n`;
        }));
        var msg = msgAr.reduce((a, b) => a + b);
        event.reply(msg);
        return true;
    }
    return false;
};

module.exports = service;


