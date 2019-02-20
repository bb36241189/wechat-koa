const { parseString } = require("xml2js");

module.exports = xml =>
  new Promise((resolve, reject) => {
    parseString(
      xml,
      {
        trim: true,
      },
      (err, result) => {
        if (err) reject(err);
        resolve(formatMessage(result.xml));
      }
    );
  });

function formatMessage(result) {
  let message = {};

  if (typeof result === "object") {
    let keys = Object.keys(result);

    keys.forEach((v, i) => {
      let item = result[keys[i]];
      let key = keys[i];

      if (!Array.isArray(item) || item.length === 0) return;

      if (item.length === 1) {
        let v = item.shift();

        if (typeof v === "object") message[key] = formatMessage(v);
        else message[key] = (v || "").trim();
      } else {
        message[key] = [];

        item.forEach(v => message[key].push(formatMessage(v)));
      }
    });
  }

  return message;
}
