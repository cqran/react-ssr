const ejs = require('ejs');
const ReactDomServer = require('react-dom/server');
const serialize = require('serialize-javascript');
const asyncBootstrap = require('react-async-bootstrapper');
const Helmet = require('react-helmet').default;

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    result[storeName] = stores[storeName].toJson();
    return result;
  }, {})
}

module.exports = (bundle, template, req, res) => {

  return new Promise((resolve, reject) => {
    // 创建stores的方法
    const createStoreMap = bundle.createStoreMap;
    // 根据serverEntry中export default的内容创建应用
    const createApp = bundle.default;

    const routerContext = {};
    const stores = createStoreMap();
    // 传入参数在服务端创建应用
    const app = createApp(stores, routerContext, req.url);

    asyncBootstrap(app).then(() => {
      if (routerContext.url) {
        res.status(302).setHeader('Location', routerContext.url)
        res.end();
        return;
      }

      const helmet = Helmet.rewind();
      const state = getStoreState(stores);
      console.log(state);
      const content = ReactDomServer.renderToString(app);
      // 使用ejs渲染前端模板
      const html = ejs.render(template, {
        appString: content,
        initialState: serialize(state),
        meta: helmet.meta.toString(),
        title: helmet.meta.toString(),
        link: helmet.link.toString(),
        style: helmet.link.toString()
      })
      // 发送渲染后的页面
      res.send(html);
      resolve()
    }).catch(reject)
  })
}