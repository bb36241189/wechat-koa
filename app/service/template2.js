const njk = require("nunjucks");

const tpl = `
  <xml>
    <ToUserName><![CDATA[{{ toUserName }}]]></ToUserName>
    <FromUserName><![CDATA[{{ fromUserName }}]]></FromUserName>
    <CreateTime>{{ createTime }}</CreateTime>
    <MsgType><![CDATA[{{ msgType }}]]></MsgType>
    <Content><![CDATA[{{ content }}]]></Content>
    <FuncFlag>0</FuncFlag>
  </xml>`;

const autoReplyTpl = njk.compile(tpl);

module.exports = {
  autoReplyTpl,
};
