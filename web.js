'use strict';

var express = require("express");
var app = express();

app.get("/", function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.send(`empty home`);
});

const port = process.env.PORT;
app.listen(port, function () {
  console.log(`web.js listening on port ${port}`);
});


