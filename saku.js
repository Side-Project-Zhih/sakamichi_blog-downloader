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
const INDEX = "https://sakurazaka46.com"
const pageUrl = [];
const blogUrl = [];
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
  MEMBER_NUM = res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  // console.log(res);
  // console.log(MEMBER_NUM, page, endPage);
  // make page Url
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://sakurazaka46.com/s/s46/diary/blog/list?&page=${i}&cd=blog&ct=${MEMBER_NUM}`)
  };
  pageUrl.forEach(page => {
    axios.get(page).then(res => {

      const dom = new jsdom.JSDOM(res.data);
      let document = dom.window.document;
      let blogs = document.querySelectorAll('.member-blog-listm .box a');
      return blogs
    }).then(res => {
      const blogs = res;
      blogs.forEach(blog => {
        const link = INDEX + blog.href;
        axios.get(link).then(res => {
          const dom = new jsdom.JSDOM(res.data);
          const document = dom.window.document;
          const name = document.querySelector('.com-hero-title').textContent.split(' 公')[0]
          const title = document.querySelector(".title-wrap");
          const date = `${document.querySelector('.ym-year').textContent}-${document.querySelector('.ym-month').textContent}-${document.querySelector('.date').textContent}`;
          const pic = [...document.querySelectorAll('.box-article img')].map(img => INDEX + img.src);         
          const content = document.querySelector('.box-article');
          const path = `${__dirname}/${name}/${date}`
          mkdirp(path).then(made =>
            console.log(`建立資料夾成功`)).then(() => {
              //download blog content
              fs.writeFile(`${path}/${title.textContent.slice(0,10)}.html`, title.innerHTML+'<br><br><br>'+content.innerHTML, function (err, result) {
                if (err) console.log('error', err);
                console.log('文章下載成功');
              });
              //download pics
              pic.forEach(item => {
                download(item, path).then(() => console.log('我看者妳載照片 嘿嘿'))
              })
            });
        })

      })
    })
  })


})


