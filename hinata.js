const fs = require('fs');
const https = require('https');

const mkdirp = require('mkdirp');
const download = require('download');
const axios = require('axios');
const jsdom = require("jsdom");
const inquirer = require('inquirer');

let MEMBER_NUM;
let page;
let endPage;
let pageUrl = [];

var questions = [
  {
    type: 'input',
    name: 'num',
    message: "成員編號:"
  }, {
    type: 'input',
    name: 'page',
    message: "頁碼:"
  }, {
    type: 'input',
    name: 'endPage',
    message: "最後頁碼:"
  }
];

inquirer.prompt(questions).then(res => {
  MEMBER_NUM = +res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://www.hinatazaka46.com/s/official/diary/member/list?page=${i}&ct=${MEMBER_NUM}`)
  };

  pageUrl.forEach(page => {
    axios.get(page).then(res => {
      const dom = new jsdom.JSDOM(res.data);
      const document = dom.window.document;
      const name = document.querySelector('.c-blog-article__name').textContent.trim();
      const title = document.querySelectorAll(".c-blog-article__title");
      const date = document.querySelectorAll('.c-blog-article__date');
      const content = document.querySelectorAll('.c-blog-article__text');
      title.forEach((item, i) => {

        let ym = date[i].textContent.trim().replace(":", "時").replace(' ', '-');

        let newTitle = title[i].textContent.trim()

        const path = `${__dirname}/${name}/${ym}`

        mkdirp(path).then(made =>
          console.log(`建立資料夾成功`)).then(() => {
            //blog content
            fs.writeFile(`${path}/${newTitle.slice(0,10)}.html`, title[i].innerHTML+'<br><br><br>'+content[i].innerHTML, function (err, result) {
              if (err) console.log('error', err);
              console.log('文章下載成功');
            });
            // download pics
            const blogPicAll = content[i].querySelectorAll('img')
            let pics = [...blogPicAll].map(pic => pic.src)
            pics.forEach(pic => {
              download(pic, path).then(() => console.log('我看者妳載照片 嘿嘿'))

            })
          });
      });


    });

  });


});