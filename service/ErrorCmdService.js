
var service = {};

const msg = `bot使用說明請見此連結：
https://github.com/kiwislice/LineBot/blob/master/echo-bot/README.md
`;

service.handle = function (cmd, event) {
    if (cmd.startsWith('bot')) {
        event.reply(msg);
    }
};

module.exports = service;


