"use strict";

const crypto = require("crypto");

class WxBizMsgCrypt {
  constructor() {
    this.token = "mp_xiaofan_test";
    this.appid = "wxc3bbc97faacb03d9";
    this.aesKey = new Buffer(
      "Pz2HGvXAYZbZK18eqSraaQ5toqIFip0a4cdFYwrTNvw" + "=",
      "base64"
    );
    this.IV = this.aesKey.slice(0, 16);
  }

  encrypt(string) {
    let random16 = crypto.pseudoRandomBytes(16);

    let msg = new Buffer(string);

    let msgLength = new Buffer(4);
    msgLength.writeUInt32BE(msg.length, 0);

    let corpId = new Buffer(this.appid);

    let raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);
    // let encoded = this.PKCS7Encode(raw_msg);
    raw_msg = this.PKCS7Encode(raw_msg);
    let cipher = crypto.createCipheriv("aes-256-cbc", this.aesKey, this.IV);
    cipher.setAutoPadding(false);

    let cipheredMsg = Buffer.concat([
      cipher.update(/* encoded */ raw_msg),
      cipher.final(),
    ]);

    return cipheredMsg.toString("base64");
  }

  decrypt(text) {
    return new Promise((resolve, reject) => {
      let decipher, plain_text;
      try {
        decipher = crypto.Decipheriv("aes-256-cbc", this.aesKey, this.IV);
        decipher.setAutoPadding(false);
      } catch (err) {
        reject(err);
      }
      // crypto.Decipheriv == crypto.createDecipheriv

      let decipheredBuff = Buffer.concat([
        decipher.update(text, "base64"),
        decipher.final(),
      ]);
      // console.log( new Buffer(decipheredBuff).toString('utf-8'))
      decipheredBuff = this.PKCS7Decode(decipheredBuff);

      let len_netOrder_corpid = decipheredBuff.slice(16);
      // 切割掉16个随机字符，剩余为 (4字节的 msg_len) + msg_content(长度为 msg_len ) + msg_appId
      let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
      let msg_content = len_netOrder_corpid
        .slice(4, msg_len + 4)
        .toString("utf-8");
      let msg_appId = len_netOrder_corpid.slice(msg_len + 4).toString("utf-8");

      resolve(msg_content);
    });
  }
  PKCS7Decode(buff) {
    let pad = buff[buff.length - 1];
    /* PKCS7 填充字节长度 = 每个字节填充的字符
     * lastBuf = padBuff.length = pad
     */
    if (pad < 1 || pad > 32) {
      pad = 0;
    }
    return buff.slice(0, buff.length - pad);
  }
  PKCS7Encode(buff) {
    let blockSize = 32;
    let amountToPad = blockSize - (buff.length % blockSize);
    if (amountToPad == 0) {
      amountToPad = blockSize;
    }
    let pad = new Buffer(amountToPad);
    // pad.fill(String.fromCharCode(amountToPad))
    pad.fill(amountToPad);
    let newBuff = Buffer.concat([buff, pad]);
    return newBuff;
  }
  getSignature(ToKen, timestamp, nonce, encryptStr) {
    let raw_signature = [ToKen, timestamp, nonce, encryptStr].sort().join("");

    let sha1 = crypto.createHash("sha1");
    sha1.update(raw_signature);

    return sha1.digest("hex");
  }
}

const wxBizMsgCrypt = new WxBizMsgCrypt();

module.exports = wxBizMsgCrypt;
