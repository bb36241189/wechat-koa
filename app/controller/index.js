const proving = require("../service/proving");
const autoReply = require("../service/auto-reply");

module.exports = {
  "get /": async (ctx, next) => {
    // await next(); // 调用下一个中间件

    let provide = proving(ctx.query);
    ctx.body = provide || "欢迎访问微信第三方服务器";
  },
  "post /": async ctx => {
    let body = await autoReply({
      req: ctx.req,
      length: ctx.length,
      charset: ctx.charset,
    });

    console.log(body);

    ctx.type = "application/xml";
    ctx.body = body;
  },
};
