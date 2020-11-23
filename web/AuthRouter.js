
const SERVICE_ID = `AuthRouter`;

var router = require('express').Router();
const repository = require('../service/Repository');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

router.options('/auth/login', function (req, res, next) {
    next();
});

router.post('/auth/login', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    var name = req.body.name;
    var uid = null;
    var success = false;
    if (name) {
        uid = uuidv4();
        repository.createUser({ id: uid, name: name });
        success = true;
    }
    res.send({ success: success, uid: uid });

    console.log(`${SERVICE_ID} filter end`);
    next();
});

router.get('/auth/isAuthenticated/:uid', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    var rtn = { isAuthenticated: false, uid: req.params.uid };
    if (req.params.uid) {
        var user = repository.getUserById(req.params.uid);
        rtn.isAuthenticated = !!user;
    }
    res.send(rtn);

    console.log(`${SERVICE_ID} filter end`);
});

module.exports = router;
