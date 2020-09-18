const proving = require("../service/proving");
const autoReply = require("../service/auto-reply");
const mysql = require("../service/mysql");
const cloudFileService = require("../service/cloudFileService");
const getRawBody = require("raw-body");
const config = require('../../config');

module.exports = {
	"get /": async (ctx, next) => {
		// await next(); // 调用下一个中间件

		let provide = proving(ctx.query);
		ctx.body = provide || "欢迎访问微信第三方服务器";
	},
	"get /qa": async (ctx, next) => {
                ctx.response.set("Access-Control-Allow-Origin","*");
		let has_audio = ctx.request.query.has_audio;
                let ret = await mysql.queryQa(has_audio);
                ctx.body = JSON.stringify(ret);
        },
	"get /qaByOrderNo": async (ctx,next) => {
		let ret = await mysql.queryQaByOrderNo(ctx.request.query.order_no);
		if(ret.length){
			ret[0].qa_audio_file = await cloudFileService.getFileByidAsync(ret[0].qa_audio);
		}
		ctx.response.set("Access-Control-Allow-Origin","*");
		ctx.body = JSON.stringify(ret);
	},
	"get /cloudfile": async (ctx,next) => {
		let file = await cloudFileService.getFileById(ctx.request.query.id);
		ctx.response.set("Access-Control-Allow-Origin","*");
		ctx.body = JSON.stringify(file);
	},
        "get /saveQa" : async (ctx, next2) => {
                let {order_no,quesion,prev,now,next} = ctx.request.query;
                let ret = await mysql.saveQa(order_no,quesion,prev,now,next);
                ctx.response.set("Access-Control-Allow-Origin","*");
                ctx.body = JSON.stringify(ret);
        },
        "get /updateQa": async (ctx,next) => {
                let {order_no,audio_url,qa_to} = ctx.request.query;
                let ret = await mysql.udpateQa(order_no,audio_url,qa_to);
                ctx.response.set("Access-Control-Allow-Origin","*");
                ctx.body = JSON.stringify(ret);
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
	"post /buildOrder": async ctx => {
		let rawBody = await getRawBody(ctx.req, {
			length: ctx.length,
			limit: "1mb",
			encoding: ctx.charset,
		});
		console.log('req',ctx.req.headers.referer);
		//console.log(rawBody.toString());
		ctx.response.set("Content-Type", "application/json");
		ctx.body = "{}";
	}

};
