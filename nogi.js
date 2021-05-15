const fs = require("fs");
const https = require("https");

const mkdirp = require("mkdirp");
const download = require("download");
const axios = require("axios");
const jsdom = require("jsdom");
const inquirer = require("inquirer");
const memberList = require("./nogiMember.json");
const dectectRepeat = require("./hepler/helper").dectectRepeat;

let MEMBER_NAME;
let page;
let endPage;
let pageUrl = [];
console.log("--------------成員羅馬拼音---------------");
console.log("=====================================");
memberList.forEach((member) => {
  console.log(member);
});
console.log("=================================================");
console.log("請複製貼上對應的羅馬拼音");
console.log("=================================================");

var questions = [
  {
    type: "input",
    name: "name",
    message: "成員名字:",
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
  MEMBER_NAME = res.name;
  page = +res.page;
  endPage = +res.endPage;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(`http://blog.nogizaka46.com/${MEMBER_NAME}/?p=${i}`);
  }
  pageUrl.map(async (page) => {
    const res = await axios.get(page);
    const dom = new jsdom.JSDOM(res.data);
    const document = dom.window.document;
    const name = document.querySelector(".author").textContent;
    const title = document.querySelectorAll(".entrytitle a");
    let date = [...document.querySelectorAll(".date")].map((item) =>
      [...item.querySelectorAll("span")]
        .slice(0, 2)
        .map((item) => item.textContent)
        .join("-")
        .replace("/", "-")
    );
    date = dectectRepeat(date);
    const content = document.querySelectorAll(".entrybody");
    [...title].map((item, i) => {
      let ym = date[i];
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
                  function (err, result) {
                    if (err) console.log("文章標題有問題");
                    console.log("文章檔名更改並下載成功");
                  }
                );
              };
              console.log("文章下載成功");
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
