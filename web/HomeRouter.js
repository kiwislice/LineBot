
const SERVICE_ID = `HomeRouter`;

var router = require('express').Router();

router.get('/', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);
    res.send(`empty home`);
    console.log(`${SERVICE_ID} filter end`);
});

module.exports = router;
