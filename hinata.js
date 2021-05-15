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

inquirer.prompt(questions).then((res) => {
  MEMBER_NUM = +res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://www.hinatazaka46.com/s/official/diary/member/list?page=${i}&ct=${MEMBER_NUM}`
    );
  }

  pageUrl.map(async (page) => {
    const res = await axios.get(page);
    const dom = new jsdom.JSDOM(res.data);
    const document = dom.window.document;
    const title = document.querySelectorAll(".c-blog-article__title");
    const name = document
      .querySelector(".c-blog-article__name")
      .textContent.trim();
    const date = document.querySelectorAll(".c-blog-article__date");
    const content = document.querySelectorAll(".c-blog-article__text");

    [...title].map((item, i) => {
      let ym = date[i].textContent.trim().replace(":", "時").replace(" ", "-");
      let newTitle = title[i].textContent.trim();
      const blogPicAll = content[i].querySelectorAll("img");
      let pics = [...blogPicAll].map((pic) => pic.src);
      const path = `./${name}/${ym}`;

      fs.access(path, async (err) => {
        if (!err) {
          console.log("blog已下載過");
        } else {
          const folder = await mkdirp(path);
          console.log(`建立資料夾成功`);
          const article = await fs.writeFile(
            `${path}/${newTitle}.html`,
            title[i].innerHTML + "<br><br><br>" + content[i].innerHTML,
            function (err, result) {
              if (err) {
                fs.writeFile(
                  `${path}/${ym}.html`,
                  title[i].innerHTML + "<br><br><br>" + content[i].innerHTML,
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
          pics.map(async (pic) => {
            const downloadPics = await download(pic, path);
            console.log("我看者你載照片 嘿嘿");
          });
        }
      });
    });
  });
});
