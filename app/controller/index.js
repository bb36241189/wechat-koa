const proving = require("../service/proving");
const autoReply = require("../service/auto-reply");
const config = require('../../config');

module.exports = {
  "get /": async (ctx, next) => {
    // await next(); // 调用下一个中间件

    let provide = proving(ctx.query);
    ctx.body = provide || "欢迎访问微信第三方服务器";
  },
  "post /": async ctx => {
    let body = await autoReply({
      req: ctx.req,
      url : ctx.url,
      length: ctx.length,
      charset: ctx.charset,
    });

    console.log(body);

    if(config.isXML){
	//ctx.type = "application/xml";
        ctx.response.set("Content-Type", "application/xml");
    }else{
	//ctx.type = "application/json";
        ctx.response.set("Content-Type", "application/json");
    }	  
    ctx.body = body;
  },
};
