const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const favicon = require('serve-favicon');
const app = express();
const serverRender = require('./utils/serverRender');
// 是否时开发环境
const isDev = process.env.NODE_ENV === 'development';

app.use(bodyParser.json()); // 请求放入req.body中
app.use(bodyParser.urlencoded({
  extended: false // 表单请求也放入req.body中
}));
app.use(session({
  maxAge: 10*60*100,
  name: 'access_id',
  resave: false,
  saveUninitialized: false,
  secret: 'Zsmart-TF_Bank'
}));

app.use(favicon(path.join(__dirname, '../favicon.ico')));

if (isDev) {
  // 开发时的服务端渲染
  const devStatic = require('./utils/devStatic');
  devStatic(app);
} else {
  // 生产环境下的服务端渲染
  const serverEntry = require('../dist/serverEntry');
  const template = fs.readFileSync(path.join(__dirname, '../dist/server.ejs'), 'utf-8');
  app.use('/public', express.static(path.join(__dirname, '../dist')));
  app.get('*', function (req, res, next) {
    serverRender(serverEntry, template, req, res).catch(next);
  })
}

// 错误处理
app.use(function(error, req, res, next){
  console.warn(error);
  res.status(500).send(error);
});

app.listen(3000, function () {
  console.log('🎉 ==> server is running on 3000');
})
