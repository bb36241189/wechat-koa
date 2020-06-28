const getRawBody = require("raw-body");
const formatXML = require("../utils/format-xml");
const wxBizMsgCrypt = require("../middleware/wxBizMsgCrypt");
const handlerReply = require("./handler-reply");

module.exports = async opts => {
  let wxMsg;
  let isEncryption = true;
  let isJSON = true;

  let rawBody = await getRawBody(opts.req, {
    length: opts.length,
    limit: "1mb",
    encoding: opts.charset,
  });
  
  console.log(rawBody.toString());

  try {
    let Encrypt;
    if(isJSON){
	let json = JSON.parse(rawBody.toString()); 
	Encrypt = json.Encrypt;
    }else{
	let json = await formatXML(rawBody);
	Encrypt = json.Encrypt;
    }
    let rawBodyDecrypted = await wxBizMsgCrypt.decrypt(Encrypt);
    console.log(rawBodyDecrypted);
    if(isJSON){
	wxMsg = JSON.parse(rawBodyDecrypted);
    }else{
	wxMsg = await formatXML(rawBodyDecrypted);
    }
  } catch (e) {
    wxMsg = await formatXML(rawBody);
    isEncryption = false;
  }

  return await handlerReply(wxMsg, isEncryption,opts);
};
