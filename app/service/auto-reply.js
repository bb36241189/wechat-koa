const getRawBody = require("raw-body");
const formatXML = require("../utils/format-xml");
const wxBizMsgCrypt = require("../middleware/wxBizMsgCrypt");
const handlerReply = require("./handler-reply");

module.exports = async opts => {
  let wxMsg;
  let isEncryption = true;

  let rawBody = await getRawBody(opts.req, {
    length: opts.length,
    limit: "1mb",
    encoding: opts.charset,
  });

  try {
    let { Encrypt } = await formatXML(rawBody);
    wxMsg = await formatXML(await wxBizMsgCrypt.decrypt(Encrypt));
  } catch (e) {
    wxMsg = await formatXML(rawBody);
    isEncryption = false;
  }

  return await handlerReply(wxMsg, isEncryption);
};
