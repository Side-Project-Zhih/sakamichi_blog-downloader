const fs = require("fs");
const download = require("download");
const axios = require("axios");
const jsdom = require("jsdom");
let data = require("./member.json");
const produceDoc = (body) => {
  return new jsdom.JSDOM(body).window.document;
};

let membersUrl =data.map(
  (member) => `https://sakurazaka46.com/s/s46/artist/${member}`
);

Promise.all(
  membersUrl.map(async (member) => {
    let body = await axios.get(member);
    body = body.data;
    const document = produceDoc(body);
    const name = document.querySelector(".prof-elem .name").textContent;
    let pics = document.querySelectorAll(".inner-v2 img");
    pics = [...pics];
    pics = pics.map((item) => {
      item.src = item.src.replace("1000_1000_102400", "");
      return `https://sakurazaka46.com/${item.src}`;
    });
    return { name, pics };
  })
).then((data) => {
    return Promise.all(
      data.map((member) => {
        const { name, pics } = member;
        return Promise.all(
          pics.map((pic, i) => {
            const path = `./賀卡`;
            return download(pic, path, { filename: `${name}(${i}).jpg` });
          })
        ).then(() => console.log(`${name} downloaded`));
      })
    );
  })
  .then(() => console.log("finish"))
  .catch((e) => console.log(e));
