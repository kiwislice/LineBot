'use strict';

var express = require("express");
var app = express();

app.get("/", function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.send(`empty home`);
});

app.listen(80, function () {
  console.log("web.js listening on port 80");
});


