const crypto = require("crypto");

module.exports = query => {
  // 微信服务端验证
  let { signature, echostr, timestamp, nonce } = query;

  // 这里的token 要和你表单上面的token一致
  let token = "mp_xiaofan_test";

  // 根文档上面的,我们需要对这三个参数进行字典序排序
  let arr = [token, timestamp, nonce];
  arr.sort();
  let tmpStr = arr.join("");

  // 排序完成之后,需要进行sha1加密
  let resStr = crypto
    .createHash("sha1")
    .update(tmpStr)
    .digest("hex");

  if (resStr === signature) {
    return echostr;
  }

  return false;
};
