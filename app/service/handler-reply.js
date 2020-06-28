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

  if (content === "") {
    return "success";
  }else if(isXML){
    return autoReplyTpl.render({
        toUserName,
        fromUserName,
        createTime,
        msgType,
        content,
      }).replace(/[\r\n\s]/g,"");
  }else{
    return JSON.stringify({
        ToUserName: toUserName,
        FromUserName:fromUserName,
        CreateTime: createTime,
        MsgType: msgType,
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

  if(wxMsg.MsgType == 'event' && wxMsg.Event == 'user_enter_tempsession'){
    if(wxMsg.SessionFrom == 'jyg'){
        let sendRet = await customerServiceMessage.send(wxMsg.FromUserName,'link',{});
    }else if(wxMsg.SessionFrom == 'sly'){
        let sendRet = await customerServiceMessage.sendWxNumber(wxMsg.FromUserName,'link',{});
    }
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
