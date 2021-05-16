const fs = require("fs");
const https = require("https");

const mkdirp = require("mkdirp");
const download = require("download");
const axios = require("axios");
const jsdom = require("jsdom");
const inquirer = require("inquirer");
const memberList = require("./sakuList.json");
const dectectRepeat = require("./hepler/helper").dectectRepeat;

let MEMBER_NUM;
let page;
let endPage;
const INDEX = "https://sakurazaka46.com";
const pageUrl = [];
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
console.log("===============================================");
console.log("若成員編號為個位數請補上'0'  ex '03' 不要輸入 '3'");
console.log("===============================================");

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
  MEMBER_NUM = res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://sakurazaka46.com/s/s46/diary/blog/list?&page=${i}&cd=blog&ct=${MEMBER_NUM}`
    );
  }

  let reqNum = 0;

  let pageUrlLog = await Promise.all(
    pageUrl.map(async (page,i) => {
      const res = await axios.get(page);
      const dom = new jsdom.JSDOM(res.data);
      const document = dom.window.document;
      const name = document
        .querySelector(".com-hero-title")
        .textContent.split("　公")[0]
        .trim();
      let blogLinks = document.querySelectorAll(".member-blog-listm .box a");
      let blogTitles = document.querySelectorAll(
        ".member-blog-listm .box .title"
      );
      let blogDates = document.querySelectorAll(
        ".member-blog-listm .box .date"
      );
      blogLinks = [...blogLinks].map((item) => INDEX + item.href);
      blogTitles = [...blogTitles].map((item) => item.textContent);
      blogDates = [...blogDates].map((item) =>
        item.textContent.split("/").join("-")
      );
      blogDates = dectectRepeat(blogDates);
      await timeout(i * 5000);
      console.log(`page - ${i}`)
      let blogsLog = await Promise.all(
        blogLinks.map(async (link, i) => {
          const res = await axios.get(link);
          const dom = new jsdom.JSDOM(res.data);
          const document = dom.window.document;
          const pics = [];
          const title = blogTitles[i];
          const date = blogDates[i];
          document
            .querySelector(".box-article")
            .querySelectorAll("img")
            .forEach((url) => {
              let separate = url.src.split("/");
              const length = separate.length;
              pics.push(INDEX + url.src);
              url.src = separate[length - 1];
            });
          const content = document.querySelector(".box-article");
          const path = `./${name}/${date}`;
          fs.access(path, async (err) => {
            if (!err) {
              console.log("blog已下載過");
            } else {
              const folder = await mkdirp(path);
              console.log(`建立資料夾成功`);
              const article = await fs.writeFile(
                `${path}/${title}.html`,
                `<h1>${title}</h1>` + "<br><br><br>" + content.innerHTML,
                function (err, result) {
                  if (err) {
                    fs.writeFile(
                      `${path}/${date}.html`,
                      `<h1>${title}</h1>` + "<br><br><br>" + content.innerHTML,
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
              let blogAllpic = await Promise.all(
                pics.map(async (pic) => {
                  reqNum += 1;
                  let num = reqNum;
                   await timeout(reqNum * 100);
                  const downloadPics = await download(pic, path).then(() =>
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
