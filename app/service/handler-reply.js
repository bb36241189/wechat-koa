const mp = require("../../config/mp");
const isXML = require('../../config/index').isXML
const wxBizMsgCrypt = require("../middleware/wxBizMsgCrypt");

const { autoReplyTpl } = require("./template");
const replyContent = require("../../config/reply-content");
const { getMaterial } = require("./material");
const customerServiceMessage = require("./customerServiceMessage");
var url=require('url');
var qs = require("querystring");

const replyRule = async (wxMsg) => {
	let content = "";
	let msgType = "text";
	let toUserName = wxMsg.FromUserName;
	let fromUserName = wxMsg.ToUserName;
	let MsgId = wxMsg.MsgId + 2;
	let createTime = Math.ceil(Date.now() / 1000);

	for (let rc of replyContent) {
		if (rc.msgType.includes(wxMsg.MsgType)) {
			if (!(rc.event && wxMsg.Event) || rc.event === wxMsg.Event) {
				if (!(rc.content && wxMsg.Content) || rc.content === wxMsg.Content) {
					msgType = rc.replyType || "text";
					content = rc.tpl;

					if (msgType === "news" && rc.tpl.mediaId) {
						content = await findMaterial(rc.tpl.mediaId, msgType);
					}

					break;
				}
			}
		}
	}

	//if (content === "") {
	//return "success";
	//}else
	if(isXML){
		return autoReplyTpl.render({
			toUserName,
			fromUserName,
			createTime,
			msgType: 'transfer_customer_service',
			content,
		}).replace(/[\r\n\s]/g,"");
	}else{
		return JSON.stringify({
			ToUserName: toUserName,
			FromUserName:fromUserName,
			CreateTime: createTime,
			MsgType: 'transfer_customer_service',
			Content: content,
			MsgId : MsgId
		});
	}
};

async function findMaterial(mediaId, type) {
	let data = await getMaterial({ mediaId });

	// for (let item of data.item) {
	//   if(item.)
	// }

	console.log(data);

	let items;

	if (type === "news") {
		items = (data.news_item || []).map(item => ({
			title: item.title,
			description: item.digest,
			picUrl: item.thumb_url,
			url: item.url,
		}));
	}

	return items;
}

module.exports = async (wxMsg, isEncryption,opts) => {
	let replyContent = await replyRule(wxMsg,opts);

	/*if(wxMsg.MsgType == 'event' && wxMsg.Event == 'user_enter_tempsession'){
    if(wxMsg.SessionFrom == 'jyg'){
	let sendRet = await customerServiceMessage.send(wxMsg.FromUserName,'link',{});
    }else if(wxMsg.SessionFrom == 'sly'){
	let sendRet = await customerServiceMessage.sendWxNumber(wxMsg.FromUserName,'link',{});
    }
  }*/
	if(wxMsg.Content == '喵')
	{
		await customerServiceMessage.sendText(wxMsg.FromUserName,'link','你好呀，我是喵巫，倾诉解忧陪聊点击下方链接哈！');
                await customerServiceMessage.sendLink(wxMsg.FromUserName,'link',{
                        "title": "欢迎光临喵巫解忧馆",
                        "description": "点击关注，订阅每周运势",
                        "url": "http://t.biyouxinli.com/Fju6Bb",
                        "thumb_url": "https://img.fenfenriji.com//69/27/03/Image/242B605A-8CB6-24D7-9BC1-5EF83723E2D7.jpeg"
                });
                await customerServiceMessage.sendText(wxMsg.FromUserName,'link','里面也有些专业心理测评，希望能帮助到亲爱的你');
                await customerServiceMessage.sendText(wxMsg.FromUserName,'link','如果想要1对1塔罗解惑，可以长按识别下方添加我微信，喵巫都在哦');
                await customerServiceMessage.sendWxPic(wxMsg.FromUserName,'link',{});
	}else if(wxMsg.SessionFrom == 'jyg' && wxMsg.Content == '喵'){
		await customerServiceMessage.sendLink(wxMsg.FromUserName,'link',{
			"title": "欢迎光临喵巫解忧馆",
			"description": "点击关注，订阅每周运势",
			"url": "http://t.cn/A6LHQqg4",
			"thumb_url": "https://img.fenfenriji.com//69/27/03/Image/242B605A-8CB6-24D7-9BC1-5EF83723E2D7.jpeg"
		});
		await customerServiceMessage.sendWxPic(wxMsg.FromUserName,'link',{});
	}
	console.log('回复的内容是:',replyContent);

	if (!isEncryption || replyContent === "success") return replyContent;

	let encrypt = wxBizMsgCrypt.encrypt(replyContent);

	let dateStr = Date.now().toString();

	let arg = url.parse(opts.url).query;
	let params = qs.parse(arg);

	//const timestamp = params.timestamp;//Math.ceil(Date.now() / 1000);
	//const nonce = params.nonce;

	let timestamp = dateStr.substr(0, 5) + dateStr.substr(10, 5);

	let nonce = dateStr.substr(0, 10) + dateStr.substr(5, 5);

	let msgSignature = wxBizMsgCrypt.getSignature(
		mp.token,
		timestamp,
		nonce,
		encrypt
	);

	//console.log(await wxBizMsgCrypt.decrypt(encrypt));

	if(!isXML){
		return JSON.stringify({
			Encrypt: encrypt,
			MsgSignature: msgSignature,
			TimeStamp: timestamp,
			Nonce: nonce
		});
	}else{
		let ret = `<xml>
			<Encrypt><![CDATA[${encrypt}]]></Encrypt>
			<MsgSignature>${msgSignature}</MsgSignature>
			<TimeStamp>${timestamp}</TimeStamp>
			<Nonce>${nonce}</Nonce>
			</xml>`;
		return ret.replace(/[\r\n\s]/g,"");
	}
};
