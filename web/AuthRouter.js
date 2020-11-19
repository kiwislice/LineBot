
const SERVICE_ID = `AuthRouter`;

var router = require('express').Router();


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

router.options('/auth/login', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    console.log(`${SERVICE_ID} filter end`);
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

router.get('/auth/isAuthenticated/:token', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    // req.params.token
    // var uid = req.cookies && req.cookies.uid;
    res.send({ isAuthenticated: (req.params.token ? true : false) });

    console.log(`isAuthenticated uid=${uid}`);
    console.log(`${SERVICE_ID} filter end`);
    next();
});

module.exports = router;
