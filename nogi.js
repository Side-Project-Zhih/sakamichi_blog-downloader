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
const timeout = (time) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};
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
inquirer.prompt(questions).then(async (res) => {
  MEMBER_NAME = res.name;
  page = +res.page;
  endPage = +res.endPage;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(`http://blog.nogizaka46.com/${MEMBER_NAME}/?p=${i}`);
  }
  let reqNum = 0;
  let data = await Promise.all(
    pageUrl.map(async (page, i) => {
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
      let content = document.querySelectorAll(".entrybody");
      await timeout(i * 5000);
      let allPics = await Promise.all(
        [...title].map(async (item, i) => {
          let ym = date[i];
          let newTitle = title[i].textContent.trim();
          const blogPicAll = content[i].querySelectorAll("img");
          let pics = [...blogPicAll].map((pic) => pic.src);
          [...blogPicAll].map((pic) => {
            let separate = pic.src.split("/");
            const length = separate.length;
            pic.src = separate[length - 1];
            return separate[length - 1];
          });
          content = document.querySelectorAll(".entrybody");
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
                      function (err, result) {
                        if (err) console.log("文章標題有問題");
                        console.log("文章檔名更改並下載成功");
                      }
                    );
                  }
                  console.log("文章下載成功");
                }
              );
              // download pics
              const log = await Promise.all(
                pics.map(async (pic, i) => {
                  try{
                    reqNum += 1;
                    let num = reqNum;
                    await timeout(reqNum * 300);
                    const downloadPics = await download(pic, path).then(() =>
                      console.log("我看者你載照片 嘿嘿")
                    );
                    console.log(num);

                  } catch{
                    console.log('err')
                  }

                })
              );
            }
          });
        })
      );
    })
  );
});
