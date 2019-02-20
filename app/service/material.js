const fs = require("fs");
const request = require("request-promise");
const { acquire } = require("../utils/access-token");
const url = require("url");

async function material({ type, path, opts, isTemp, isVideo }) {
  let accessToken = await acquire();

  let forever = "https://api.weixin.qq.com/cgi-bin/material/";
  let temp = "https://api.weixin.qq.com/cgi-bin/media/";

  let prefixUrl = isTemp ? temp : forever;

  if (isVideo && isTemp) {
    prefixUrl = prefixUrl.replace(/https/, "http");
  }

  let baseUrl = url.resolve(prefixUrl, path);

  const url_ =
    baseUrl + "?access_token=" + accessToken + (type ? "&type=" + type : "");

  return await request({
    url: url_,
    json: true,
    ...opts,
  })
    .then(d => {
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

// 新增[永久/临时]素材
async function addMaterial({ type, filepath, isTemp = false, extraData = {} }) {
  let form = {
    ...extraData,
  };

  if (type !== "news") {
    form.access_token = await acquire();

    if (type !== "newsImg") {
      form.type = type;
    }

    if (filepath) {
      form.media = fs.createReadStream(filepath);
    }
  }

  let opts = {
    method: "post",
  };

  let path = isTemp ? "upload" : "add_material";

  if (type === "news") {
    opts.body = form;
  } else {
    opts.formData = form;
  }

  let params = {
    opts,
    isTemp,
  };

  if (type === "news") {
    path = "add_news";
  } else if (type === "newsImg") {
    path = "uploadimg";
    params.isTemp = true;
  } else {
    params.type = type;
  }

  params.path = path;

  return await material(params).then(console.log);
}
// {
//   "0X6SktLk94QwdmujymwdTrw4IPQg3dn0ziS4bofPZtc";
// }
// addMaterial({
//   type: "news",
//   // filepath: "./app/assets/1.jpg",
//   extraData: {
//     // description: JSON.stringify({ title: "test", introduction: "this is test" }),
//     articles: [
//       {
//         title: "999",
//         thumb_media_id: "EPGIE4NUscStI-x0l2nsm69Y_A86aVbJo1s3XS7aOvA",
//         author: "fan",
//         digest: "111111",
//         show_cover_pic: 1,
//         content:
//           "<img src='http://mmbiz.qpic.cn/mmbiz_jpg/xfTEv0RSeGAqTlric2GMciaQw0tt9UgMcl4gnGz2qEDm2TBrTK7nchia4Ehp25muf6USLvbyKaDJenj7rNibibtRicPw/0?wx_fmt=jpeg'>",
//         content_source_url: "https://www.github.com/",
//       },
//       {
//         title: "989",
//         thumb_media_id: "EPGIE4NUscStI-x0l2nsm69Y_A86aVbJo1s3XS7aOvA",
//         author: "fan",
//         digest: "111111",
//         show_cover_pic: 1,
//         content:
//           "<img src='http://mmbiz.qpic.cn/mmbiz_jpg/xfTEv0RSeGAqTlric2GMciaQw0tt9UgMcl4gnGz2qEDm2TBrTK7nchia4Ehp25muf6USLvbyKaDJenj7rNibibtRicPw/0?wx_fmt=jpeg'>",
//         content_source_url: "https://www.github.com/",
//       },
//       // 若新增的是多图文素材，则此处应还有几段articles结构
//     ],
//   },
// });

// 获取素材
async function getMaterial({ mediaId, isTemp, isVideo }) {
  let accessToken = await acquire();
  let data = {
    access_token: accessToken,
    media_id: mediaId,
  };
  let opts;

  if (isTemp) {
    opts = {
      method: "get",
      params: data,
    };
  } else {
    opts = {
      method: "post",
      body: data,
    };
  }

  return await material({
    path: "get_material",
    opts,
    isVideo,
  });
}

// 获取素材列表
async function getMaterialList({ type = "image", offset = 0, count = 20 }) {
  let opts = {
    method: "post",
    body: {
      type,
      offset,
      count,
    },
  };

  return await material({
    path: "batchget_material",
    opts,
  });
}

// 获取素材总数
async function getMaterialCount() {
  let opts = { method: "get" };

  return await material({
    path: "get_materialcount",
    opts,
  });
}

// 删除素材
async function delMaterial({ mediaId }) {
  let accessToken = await acquire();

  let opts = {
    method: "post",
    body: {
      access_token: accessToken,
      media_id: mediaId,
    },
  };

  return await material({
    path: "del_material",
    opts,
  });
}

module.exports = {
  addMaterial,
  getMaterialList,
  getMaterialCount,
  getMaterial,
  delMaterial,
};
