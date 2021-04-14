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
  MEMBER_NUM = +res.num;
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
          const title = document.querySelector("h1").textContent;
          const date = `${document.querySelector('.ym-year').textContent}-${document.querySelector('.ym-month').textContent}-${document.querySelector('.date').textContent}`;
          const pic = [...document.querySelectorAll('.box-article img')].map(img => INDEX + img.src);
          const content = document.querySelector('.box-article').textContent;
          mkdirp(`${__dirname}/${date}_${title}`).then(made =>
            console.log(`made directories successfully`)).then(() => {
              //download blog content
              fs.writeFile(`${__dirname}/${date}_${title}/${title}.html`, content, function (err, result) {
                if (err) console.log('error', err);
              });
              //download pics
              pic.forEach(item => {

                const filePath = `${__dirname}/${date}_${title}`;

                download(item, filePath)

              })
            });
        })

      })
    })
  })


})


