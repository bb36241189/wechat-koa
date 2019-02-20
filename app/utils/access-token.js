const request = require("request-promise");
const { asyncReadFile, asyncWriteFile } = require("./index");
const { appid, appsecret, pathBase } = require("../../config/mp");

const update = async () => {
  let rq = request.get(pathBase + "&appid=" + appid + "&secret=" + appsecret, {
    json: true,
  });

  return rq
    .then(
      async ({
        access_token: accessToken = "",
        expires_in: expiresIn = "",
        errmsg,
      }) => {
        if (errmsg) throw errmsg;

        await asyncWriteFile(
          "./config/access_token.txt",
          JSON.stringify({
            access_token: accessToken,
            expires_in: Date.now() + (expiresIn - 120) * 1000,
          })
        );

        return accessToken;
      }
    )
    .catch(e => {
      console.error(e);

      return "";
    });
};

const acquire = async () => {
  let {
    expires_in: expiresIn,
    access_token: accessToken = "",
  } = await asyncReadFile("./config/access_token.txt", "utf8")
    .then(d => {
      try {
        return JSON.parse(d);
      } catch (e) {
        return d;
      }
    })
    .catch(e => {
      console.error(e);

      return {};
    });

  if (accessToken === "" || Date.now() >= expiresIn) return update();

  if (accessToken) return accessToken;

  throw new Error("access_token 获取失败，请检查！");
};

module.exports = {
  acquire,
  update,
};
