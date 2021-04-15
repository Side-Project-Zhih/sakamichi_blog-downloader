const fs = require('fs');
const https = require('https');

const mkdirp = require('mkdirp');
const download = require('download');
const axios = require('axios');
const jsdom = require("jsdom");
const inquirer = require('inquirer');


let MEMBER_NAME;
let page;
let endPage;
let pageUrl = [];

var questions = [
  {
    type: 'input',
    name: 'name',
    message: "成員名字:"
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
  MEMBER_NAME = res.name;
  page = +res.page;
  endPage = +res.endPage;
  for (let i = page; i <= endPage; ++i) {
    pageUrl.push(
      `http://blog.nogizaka46.com/${MEMBER_NAME}/?p=${i}`)
  };

  pageUrl.forEach(page => {
    axios.get(page).then(res => {
      const dom = new jsdom.JSDOM(res.data);
      const document = dom.window.document;
      const name = document.querySelector('.author').textContent;
      const title = document.querySelectorAll(".entrytitle a");
      let date = [...document.querySelectorAll('.date')].map(item =>
        [...item.querySelectorAll('span')].slice(0, 2).map(item => item.textContent).join('-').replace('/', '-')
      );
      // console.log(date[0]);
      const content = document.querySelectorAll('.entrybody');
      title.forEach((item, i) => {

        let ym = date[i]
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
              download(pic, path).then(() => console.log('我看者妳載照片'))

            })
          });
      });


    });

  });


});
