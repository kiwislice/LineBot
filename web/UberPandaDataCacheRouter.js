
const SERVICE_ID = `UberPandaDataCacheRouter`;

var router = require('express').Router();
const repository = require('../service/Repository');
const PATH = '/uberPandaData';

var allStores = null;
var oneStoreScore = {};


router.get(PATH + '/getAllStores', async function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    if (allStores == null) {
        allStores = await repository.getAllStores();
    }
    console.log(allStores);
    res.send(allStores);

    console.log(`${SERVICE_ID} filter end`);
});

router.post(PATH + '/getOneStoreScore', async function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    let key = req.body.store_id + '__' + req.body.user_id;
    if (!oneStoreScore[key]) {
        oneStoreScore[key] = await repository.getOneStoreScore(req.body);
    }
    res.send(oneStoreScore[key]);

    console.log(`${SERVICE_ID} filter end`);
});

router.post(PATH + '/createStore', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    allStores = null;
    res.send('ok');

    console.log(`${SERVICE_ID} filter end`);
});

router.post(PATH + '/saveStoreScore', function (req, res, next) {
    console.log(`${SERVICE_ID} filter`);

    let key = req.body.store_id + '__' + req.body.user_id;
    delete oneStoreScore[key];
    res.send('ok');

    console.log(`${SERVICE_ID} filter end`);
});


module.exports = router;
