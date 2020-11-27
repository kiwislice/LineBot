'use strict';

require('dotenv').config();
const express = require('express');
const LinebotHelper = require('./service/LinebotHelper');
const LineNotifyService = require('./linenotify/LineNotifyService');

// 設定axios全域log
const tools = require('./service/Tools');
const axios = require('axios');
axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  var e = Object.assign({}, error);
  delete e.stack;
  // 雷達回波圖的error可略過
  if (!e.config.url.includes("www.cwb.gov.tw/Data/radar")) {
    var msg = tools.colorText(`${JSON.stringify(error)}`, 'red');
    console.log(`axios global catch error:\n${msg}`);
    LineNotifyService.sendNotifyToDev(`axios global catch error:\n${msg}`);
  }
  // Do something with response error
  return Promise.reject(error);
});


// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// linebot啟動過程都移至LinebotHelper
LinebotHelper(app);


const PrintRequestFilter = require('./web/PrintRequestFilter');
const CookieFilter = require('./web/CookieFilter');
const CrosFilter = require('./web/CrosFilter');
const HomeRouter = require('./web/HomeRouter');
const AuthRouter = require('./web/AuthRouter');




// middleware
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

// 額外加上根目錄的GET
app.use("/", /*CookieFilter,*/ CrosFilter, HomeRouter);
app.use(PrintRequestFilter, CrosFilter, AuthRouter);

// app.use(PrintRequestFilter, LineNotifyRouter);


const port = process.env.PORT;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// 啟動防止heroku休眠
const wakeup = require('./wakeup');



