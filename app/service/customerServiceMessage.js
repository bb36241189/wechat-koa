const fs = require("fs");
const request = require("request-promise");
const { acquire } = require("../utils/access-token");
const url = require("url");

function transformMessageJson(originJson){
  
}

async function send(openid, type, json ) {
  let accessToken = await acquire();
  json = {
   "touser": openid,
   "msgtype": "link",
   "link": {
       "title": "粉粉服务号",
       "description": "点击关注粉粉服务号",
       "url": "http://t.cn/A6LHQqg4",
       "thumb_url": "https://img.fenfenriji.com//69/27/03/Image/242B605A-8CB6-24D7-9BC1-5EF83723E2D7.jpeg"
   }
  }

  let url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + accessToken;

  let actionData = {
    "touser": openid,
    "msgtype":type,
  };
  actionData[type] = json;

  console.log(json);
  return await request({
    url: url,
    method: 'POST',
    json: true,
    body: json,
  })
    .then(d => {
      console.log(d);
      if (d.errmsg) {
        throw d;
      }
      return d;
    })
    .catch(e => {
      console.error(e);
      return "";
    });
}
async function sendWxNumber(openid,type,json){
  let accessToken = await acquire();

  json = {
  "touser":openid,
  "msgtype":"text",
  "text":
  {
    "content":"请添加达人微信：adsfadsf"
  }
}
  let url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + accessToken;

  let actionData = {
    "touser": openid,
    "msgtype":type,
  };
  actionData[type] = json;

  console.log(json);
  return await request({
    url: url,
    method: 'POST',
    json: true,
    body: json,
  })
    .then(d => {
      console.log(d);
      if (d.errmsg) {
        throw d;
      }
      return d;
    })
    .catch(e => {
      console.error(e);
      return "";
    });

}
exports.send = send;
exports.sendWxNumber = sendWxNumber;
