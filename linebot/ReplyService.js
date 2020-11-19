

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

function tryClearReplyMap(cmd) {
    // reply clear xxx
    var ar = cmd.match(/^reply clear (.+)/);
    if (ar) {
        if (ar[1] == 'all')
            replyMap = {};
        else if (replyMap[ar[1]])
            delete replyMap[ar[1]];
        return true;
    }
    return false;
}

service.handle = function (cmd, event) {
    if (tryClearReplyMap(cmd))
        return true;

    var isReplyCmd = tryParseReplyCmd(cmd);
    console.log(`${SERVICE_ID} replyMap=${JSON.stringify(replyMap)}`);

    if (!isReplyCmd) {
        var sourceId = tools.getSourceId(event);
        var exist = cache.findIndex(x => x.sid == sourceId && x.text == cmd) >= 0;
        if (!exist)
            cache.push({ sid: sourceId, text: cmd });
        while (cache.length > 5) {
            cache.shift();
        }
    }
    console.log(`${SERVICE_ID} 訊息cache=${JSON.stringify(cache)}`);

    for (let i = cache.length - 1; i >= 0; i--) {
        var elm = cache[i];
        if (replyMap[elm.text] != undefined) {
            service.bot.push(elm.sid, replyMap[elm.text]);
            cache.splice(i, 1);
            return true;
        }
    }
    return false;
};

module.exports = service;


