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
  MEMBER_NUM = res.num;
  page = +res.page - 1;
  endPage = +res.endPage - 1;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `https://www.keyakizaka46.com/s/k46o/diary/member/list?page=${i}&ct=${MEMBER_NUM}`)
  };


  pageUrl.forEach(page => {


    axios.get(page).then(res => {


      const dom = new jsdom.JSDOM(res.data);
      const document = dom.window.document;
      const title = document.querySelectorAll(".box-ttl a");
      const name = document.querySelector('.box-ttl p').textContent.trim();
      let date = [...document.querySelectorAll('.box-date')].map(item => {
        let time = [...item.querySelectorAll('time')];
        return time.map(item => item.textContent).join('.')

      });

      const content = document.querySelectorAll('.box-article');
      title.forEach((item, i) => {


        let ym = date[i]
        let newTitle = title[i].textContent.trim().slice(0,10);

        const path = `${__dirname}/${name}/${ym}`
        mkdirp(path).then(made =>
          console.log(`建立資料夾成功`)).then(() => {


            //blog content
            fs.writeFile(`${path}/${ym}.html`, title[i].innerHTML+'<br><br><br>'+content[i].innerHTML, function (err, result) {
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
