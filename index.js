'use strict';

require('dotenv').config();
const express = require('express');
const LinebotHelper = require('./service/LinebotHelper');



// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// linebot啟動過程都移至LinebotHelper
LinebotHelper(app);


const CookieFilter = require('./web/CookieFilter');
const CrosFilter = require('./web/CrosFilter');
const HomeRouter = require('./web/HomeRouter');


// 額外加上根目錄的GET
app.use("/", /*CookieFilter,*/ CrosFilter, HomeRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// 啟動防止heroku休眠
const wakeup = require('./wakeup');



