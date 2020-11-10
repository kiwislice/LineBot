

var service = { bot: null };

const SERVICE_ID = `ReplyService`;

const tools = require('../service/Tools');

var cache = [];
var replyMap = {};

function tryParseReplyCmd(cmd) {
    // reply:aa;dd
    var ar = cmd.match(/^reply:([^;]+);([^;]+)/);
    if (ar) {
        try {
            var o = JSON.parse(ar[2]);
            replyMap[ar[1]] = o;
        } catch (e) {
            replyMap[ar[1]] = ar[2];
        }
        return true;
    }
    return false;
}

service.handle = function (cmd, event, bot) {
    var isReplyCmd = tryParseReplyCmd(cmd);
    console.log(replyMap);

    if (!isReplyCmd) {
        var sourceId = tools.getSourceId(event);
        cache.push({ sid: sourceId, text: cmd });
        while (cache.length > 5) {
            cache.shift();
        }
    }
    console.log(cache);

    for (let i = cache.length - 1; i >= 0; i--) {
        var elm = cache[i];
        if (replyMap[elm.text] != undefined) {
            bot.push(elm.sid, replyMap[elm.text]);
            return true;
        }
    }
    return false;
};

module.exports = service;


