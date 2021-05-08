const fs = require("fs");
const https = require("https");

const mkdirp = require("mkdirp");
const download = require("download");
const axios = require("axios");
const jsdom = require("jsdom");
const inquirer = require("inquirer");
const { resolve } = require("path");

let MEMBER_NUM;
let page;
let endPage;
const INDEX = "https://sakurazaka46.com";
const pageUrl = [];

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
// 產生ODM
const produceDoc = (body) => {
  return new jsdom.JSDOM(body).window.document;
};
// 確認資料夾存在
const notExist = (path) => {
  return new Promise((res, rej) => {
    fs.access(path, (err) => {
      if (err) {
        return res(true);
      } else {
        return rej(false);
      }
    });
  });
};
// 下載文章
const writeBlog = (path, title, content) => {
  content = title.innerHTML + "<br><br><br>" + content.innerHTML;
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, function (err, result) {
      if (err) console.log("error", err);
      resolve(result);
      console.log("文章下載成功");
    });
  });
};
//promise 下載 照片、文章
const downloadFn = (path, title, pic, content) => {
  writeBlog(`${path}/${title.textContent.slice(0, 10)}.html`, title, content)
    .then((message) => {
      return Promise.all(
        pic.map((item) =>
          download(item, path).then(() => console.log("我看者妳載照片 嘿嘿"))
        )
      );
    })
    .then(() => console.log("照片OK"));
};
//參數設定
const params = (res) => {
  const document = produceDoc(res.data);
  const name = document
    .querySelector(".com-hero-title")
    .textContent.split(" 公")[0];
  const title = document.querySelector(".title-wrap");
  const date = `${document.querySelector(".ym-year").textContent}-${
    document.querySelector(".ym-month").textContent
  }-${document.querySelector(".date").textContent}`;
  const pic = [...document.querySelectorAll(".box-article img")].map(
    (img) => INDEX + img.src
  );
  const content = document.querySelector(".box-article");
  const path = `${__dirname}/${name}/${date}`;
  return [name, title, date, pic, content, path];
};


inquirer
  .prompt(questions)
  .then((res) => {
    MEMBER_NUM = res.num;
    page = +res.page - 1;
    endPage = +res.endPage - 1;
    for (let i = page; i <= endPage; ++i) {
      pageUrl.push(
        `https://sakurazaka46.com/s/s46/diary/blog/list?&page=${i}&cd=blog&ct=${MEMBER_NUM}`
      );
    }
    return pageUrl;
  })
  .then((pageUrl) => {
    return Promise.all(pageUrl.map((page) => axios.get(page)));
  })
  .then((data) => {
    let pageBody = data.map((page) => produceDoc(page.data));
    return pageBody.map((document) => {
      let blogs = document.querySelectorAll(".member-blog-listm .box a");
      return [...blogs].map((blog) => INDEX + blog.href);
    });
  })
  .then((blogsPerPage) => {
    blogsPerPage.map((blogs) => {
      blogs.map((link) => {
        return axios.get(link).then((res) => {
          const [name, title, date, pic, content, path] = params(res);
          return notExist(path)
            .then(
              (no) => {
                //  成員=>時間 資料夾不存在等同新的blog
                return "no";
              },
              (exist) => {
                //  成員=>時間 資料夾存在等同 "已下載" 故檢查下一層 "html"
                return "yes";
              }
            )
            .then((condition) => {
              // 資料夾存在
              if (condition === "yes") {

                const htmlPath = `${path}/${title.textContent.slice(
                  0,
                  10
                )}.html`;
                return notExist(htmlPath).then(() =>
                  downloadFn(path, title, pic, content)
                );
              }
              if (condition === "no") {
                // 資料夾不存;
                mkdirp(path)
                  .then(() => console.log("資料夾建立完成"))
                  .then(() => {
                    downloadFn(path, title, pic, content);
                  });
              }
            })
            .catch((e) => console.log("blog已存在"));
        });
      });
    });
  });
