
const SERVICE_ID = `UberPandaDataCacheRouter`;

var router = require('express').Router();
const repository = require('../service/Repository');
const PATH = '/uberPandaData';

var needUpdate = true;
var allStores = null;

router.get(PATH + '/getAllStores', async function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    if (!allStores) {
        allStores = await repository.getAllStores();
        lastUpdate = Date.now();
    }
    res.send(allStores);

    console.log(`${SERVICE_ID} filter end`);
});

router.post(PATH + '/createStore', async function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    var name = req.body.name;
    var uid = null;
    var success = false;
    if (!allStores) {
        allStores = await repository.getAllStores();
        lastUpdate = Date.now();
    }
    res.send(allStores);

    console.log(`${SERVICE_ID} filter end`);
});






router.options(PATH + '/createStore', function (req, res, next) {
    next();
});

// router.post('/auth/login', function (req, res, next) {
//     console.log(`${SERVICE_ID} filter`);

//     var name = req.body.name;
//     var uid = null;
//     var success = false;
//     if (name) {
//         uid = uuidv4();
//         repository.createUser({ id: uid, name: name });
//         success = true;
//     }
//     res.send({ success: success, uid: uid });

//     console.log(`${SERVICE_ID} filter end`);
//     next();
// });

// router.get('/auth/isAuthenticated/:uid', async function (req, res, next) {
//     console.log(`${SERVICE_ID} filter`);

//     var rtn = { isAuthenticated: false, uid: req.params.uid };
//     if (req.params.uid) {
//         var user = await repository.getUserById(req.params.uid);
//         rtn.isAuthenticated = !!user;
//     }
//     res.send(rtn);

//     console.log(`${SERVICE_ID} filter end`);
// });

module.exports = router;
