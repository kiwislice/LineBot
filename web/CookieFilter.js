
const SERVICE_ID = `CrosFilter`;

const repository = require('../service/Repository');

var router = require('express').Router();
var cache = {};

repository.getAllUser(response => {
    var list = response.data.data.user;
    list.forEach((elm) => {
        cache[elm.id] = true;
        console.log(`${SERVICE_ID} add cache ${elm.id}`);
    });
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

router.use(function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);
    var uid = req.cookies && req.cookies.uid;
    if (!uid) {
        uid = uuidv4();
        repository.createUser({ id: uid, name: null });
        cache.uid = true;
    }
    res.cookie('uid', uid, { expires: new Date(2025, 1), httpOnly: true });
    console.log(`${SERVICE_ID} filter end`);
    next();
});

module.exports = router;



