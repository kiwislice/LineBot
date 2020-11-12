
const SERVICE_ID = `CrosFilter`;

var router = require('express').Router();

router.use(function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`${SERVICE_ID} filter end`);
    next();
});

module.exports = router;

