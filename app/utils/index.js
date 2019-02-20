const fs = require("fs");

const asyncWriteFile = (fname, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(fname, data, (err, data) => {
      if (err) reject(err);

      resolve();
    });
  });

const asyncReadFile = (fname, encoding = "utf8") =>
  new Promise((resolve, reject) => {
    fs.stat(fname, async (err, data) => {
      if (err) await fs.writeFileSync(fname, "");

      fs.readFile(fname, encoding, (err, data) => {
        if (err) reject(err);

        resolve(data);
      });
    });
  });

module.exports = {
  asyncReadFile,
  asyncWriteFile,
};
