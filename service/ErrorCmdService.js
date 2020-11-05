
var service = {};

const msg = `bot使用說明請見此連結：
https://github.com/kiwislice/LineBot/blob/master/echo-bot/README.md
`;

function needHelp(cmd) {
    return cmd.startsWith('$bot') || cmd.startsWith('bot');
}

service.handle = function (cmd, event) {
    if (needHelp('bot')) {
        event.reply(msg);
    }
};

module.exports = service;


