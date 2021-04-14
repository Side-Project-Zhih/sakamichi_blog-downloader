const fs = require('fs');
const https = require('https');

const mkdirp = require('mkdirp');
const download = require('download');
const axios = require('axios');
const jsdom = require("jsdom");
const inquirer = require('inquirer');

let MEMBER_NUM ;
let page ;
let endPage ;
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
// https://www.hinatazaka46.com/s/official/diary/member/list?page=${i}&ct=${MEMBER_NUM}
// inquirer.prompt(questions).then(res => {
//   MEMBER_NUM = +res.num;
//   page = +res.page - 1;
//   endPage = +res.endPage - 1;

// })
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
      const title = document.querySelectorAll(".c-blog-article__title");
      // console.log(title[0].textContent);
      const date = document.querySelectorAll('.c-blog-article__date');
      const content = document.querySelectorAll('.c-blog-article__text');
      title.forEach( (item, i)=>{
          // console.log(title[i].textContent, date[i].textContent)
          let ym = date[i].textContent.trim().replace(":","時").replace(' ','-');
          // console.log(ym)
          let newTitle = title[i].textContent.trim()
          mkdirp(`${__dirname}/${ym}`).then(made =>
          console.log(`made directories successfully`)).then( () =>{
              //blog content
                fs.writeFile(`${__dirname}/${ym}/${newTitle}.html`, content[i].innerHTML, function (err, result) {
                  if (err) console.log('error', err);
                });
              // download pics
              const  blogPicAll =content[i].querySelectorAll('img')
              let pics = [...blogPicAll].map(pic => pic.src)
              pics.forEach(pic =>{
                  const filePath = `${__dirname}/${ym}`
                  download(pic, filePath).then(()=>console.log('okkk'))

              })
        });
      });
      

    });
    
});


});
