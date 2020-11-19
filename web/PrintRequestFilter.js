
const SERVICE_ID = `PrintRequestFilter`;

var router = require('express').Router();
const tools = require('../service/Tools');

router.use(function (req, res, next) {
    var msg = `
    received requext: 
    req.path=${JSON.stringify(req.path)}
    req.headers=${JSON.stringify(req.headers)}
    req.query=${JSON.stringify(req.query)}
    req.params=${JSON.stringify(req.params)}
    req.body=${JSON.stringify(req.body)}
    `;

    console.log(tools.colorText(msg));
    next();
});

module.exports = router;

