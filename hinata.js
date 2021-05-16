const fs = require("fs");
const https = require("https");

const mkdirp = require("mkdirp");
const download = require("download");
const axios = require("axios");
const jsdom = require("jsdom");
const inquirer = require("inquirer");
const memberList = require("./hinataMember.json");

let MEMBER_NUM;
let page;
let endPage;
let pageUrl = [];
const timeout = (time) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};
console.log("--------------成員編號---------------");
console.log("=====================================");
memberList.forEach((member) => {
  console.log(member);
});
console.log("=================================================");
console.log("若成員編號為個位數請直接輸入  ex '3' 不要輸入 '03'");
console.log("=================================================");

var questions = [
  {
    type: "input",
    name: "num",
    message: "成員編號:",
  },
  {
    type: "input",
    name: "page",
    message: "頁碼:",
  },
  {
    type: "input",
    name: "endPage",
    message: "最後頁碼:",
  },
];

inquirer.prompt(questions).then(async (res) => {
  MEMBER_NUM = +res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://www.hinatazaka46.com/s/official/diary/member/list?page=${i}&ct=${MEMBER_NUM}`
    );
  }
  let reqNum = 0;
  let data = await Promise.all(
    pageUrl.map(async (page, i) => {
      const res = await axios.get(page);
      const dom = new jsdom.JSDOM(res.data);
      const document = dom.window.document;
      const title = document.querySelectorAll(".c-blog-article__title");
      const name = document
        .querySelector(".c-blog-article__name")
        .textContent.trim();
      const date = document.querySelectorAll(".c-blog-article__date");
      let content = document.querySelectorAll(".c-blog-article__text");
      await timeout(i * 5000);
      let allPics = await Promise.all(
        [...title].map(async (item, i) => {
          let ym = date[i].textContent
            .trim()
            .replace(":", "時")
            .replace(" ", "-");
          let newTitle = title[i].textContent.trim();
          const blogPicAll = content[i].querySelectorAll("img");
          let pics = [...blogPicAll].map((pic) => pic.src);
          // 改道img local
          [...blogPicAll].map((pic) => {
            let separate = pic.src.split("/");
            const length = separate.length;
            pic.src = separate[length - 1];
            return separate[length - 1];
          });

          content = document.querySelectorAll(".c-blog-article__text");
          const path = `./${name}/${ym}`;

          fs.access(path, async (err) => {
            if (!err) {
              console.log("blog已下載過");
            } else {
              const folder = await mkdirp(path);
              console.log(`建立資料夾成功`);
              const article = await fs.writeFile(
                `${path}/${newTitle}.html`,
                `<h1>${title[i].textContent}</h1>` +
                  "<br><br><br>" +
                  content[i].innerHTML,
                function (err, result) {
                  if (err) {
                    fs.writeFile(
                      `${path}/${ym}.html`,
                      `<h1>${title[i].textContent}</h1>` +
                        "<br><br><br>" +
                        content[i].innerHTML,
                      (err, result) => {
                        if (err) console.log(err);
                        console.log("文章檔名更改並下載成功");
                      }
                    );
                  } else {
                    console.log("文章下載成功");
                  }
                }
              );
              // download pics
              const log = await Promise.all(
                pics.map(async (pic) => {
                  reqNum += 1;
                  let num = reqNum;
                  await timeout(reqNum * 100);

                  await download(pic, path).then(() =>
                    console.log("我看者你載照片 嘿嘿")
                  );
                  console.log(num);
                })
              );
            }
          });
        })
      );
    })
  );
});
