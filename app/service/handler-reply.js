const mp = require("../../config/mp");
const wxBizMsgCrypt = require("../middleware/wxBizMsgCrypt");

const { autoReplyTpl } = require("./template");
const replyContent = require("../../config/reply-content");
const { getMaterial } = require("./material");

const replyRule = async wxMsg => {
  let content = "";
  let msgType = "text";
  let toUserName = wxMsg.FromUserName;
  let fromUserName = wxMsg.ToUserName;
  let createTime = Date.now();

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
  }

  return autoReplyTpl.render({
    toUserName,
    fromUserName,
    createTime,
    msgType,
    content,
  });
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

module.exports = async (wxMsg, isEncryption) => {
  let replyContent = await replyRule(wxMsg);

  if (!isEncryption || replyContent === "success") return replyContent;

  let encrypt = wxBizMsgCrypt.encrypt(replyContent);

  let dateStr = Date.now().toString();

  let timestamp = dateStr.substr(0, 5) + dateStr.substr(10, 5);

  let nonce = dateStr.substr(0, 10) + dateStr.substr(5, 5);

  let msgSignature = wxBizMsgCrypt.getSignature(
    mp.token,
    timestamp,
    nonce,
    encrypt
  );

  return `<xml>
    <Encrypt><![CDATA[${encrypt}]]></Encrypt>
    <MsgSignature>${msgSignature}</MsgSignature>
    <TimeStamp>${timestamp}</TimeStamp>
    <Nonce>${nonce}</Nonce>
  </xml>`;
};
