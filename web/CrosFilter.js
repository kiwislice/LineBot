
const SERVICE_ID = `CrosFilter`;

var router = require('express').Router();

router.use(function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);
    var origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Headers', ['X-PINGOTHER', 'Content-Type']);
    console.log(`${SERVICE_ID} filter end`);
    next();
});

module.exports = router;

