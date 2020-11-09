'use strict';

const schedule = require('node-schedule');
const axios = require('axios');

// const JOB_SETTING = '0 30 10 * * 1-5';
const JOB_SETTING = '0 0,20,40 8-18 * * 1-5';


function wakeup() {
  console.log(`wakeup.js wakeup`);
  const URL = `https://soft-group-linebot-83714.herokuapp.com/`;
  // const URL = `http://127.0.0.1:80/`;
  axios.get(URL).then(function (response) {
    // handle success
    console.log(`wakeup.js wakeup success\n${response}`);
  })
    .catch(function (error) {
      // handle error
      console.log(`wakeup.js wakeup error\n${error}`);
    })
    .then(function () {
      // always executed
    });
}

schedule.scheduleJob(JOB_SETTING, wakeup);
console.log(`wakeup.js running`);


