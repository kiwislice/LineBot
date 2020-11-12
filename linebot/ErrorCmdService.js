
var service = {};

const tools = require('../service/Tools');

const msg = `bot使用說明請見此連結：
https://github.com/kiwislice/LineBot/blob/master/README.md
`;

function needHelp(cmd) {
    return cmd.startsWith('$bot') || cmd.startsWith('bot');
}

service.handle = function (cmd, event) {
    if (needHelp(cmd)) {
        event.reply(msg);
    }
};

module.exports = service;


