const fs = require("fs");
const path = require('path');
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
       "title": "欢迎光临喵巫解忧馆",
       "description": "点击关注，订阅每周运势",
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
async function sendWxPic(openid, type, json ) {
  let accessToken = await acquire();
  let imgRet = await uploadTempMedia(path.join(__dirname,'./pic.png'));
  console.log(imgRet);
  json = {
    "touser":openid,
    "msgtype":"image",
    "image": {
      "media_id":imgRet.data.media_id
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
async function uploadTempMedia(imgUrl){
  let accessToken = await acquire();
  const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=image`;
  const formData = {media :  fs.createReadStream(imgUrl)}
  return new Promise((resolve, reject) => {
    request.post({url, formData: formData}, (err, response, body) => {
      try{
        const out = JSON.parse(body);
        let result = {
          data: out,
          status: 0,
          message: "ok"
        }

        return resolve(result);

      }catch(err){
        return reject({
          status: -1,
          message: err.message
        });
      }
    });
  })
}
async function sendWxNumber(openid,type,json){
  let accessToken = await acquire();

  json = {
  "touser":openid,
  "msgtype":"text",
  "text":
  {
    "content":"请添加达人微信:wx36241189"
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
exports.sendWxPic = sendWxPic;
