const fs = require('fs');
const https = require('https');

const mkdirp = require('mkdirp');
const download = require('download');
const axios = require('axios');
const jsdom = require("jsdom");
const inquirer = require('inquirer');

fs.readFile('member.json', function (err, members) {
    if (err) throw err;
    let membersUrl = [...JSON.parse(members)].map( member => `https://sakurazaka46.com/s/s46/artist/${member}`)
    // console.log(membersUrl);
    membersUrl.forEach( member => {
      axios.get(member).then (res =>{
        const dom  = new jsdom.JSDOM(res.data);
        const document = dom.window.document;
        const name = document.querySelector('.prof-elem .name').textContent;
        // console.log(name);
        let pics = document.querySelectorAll('.inner-v2 img');
        pics = [...pics]
        pics=pics.map(item =>{
          item.src=item.src.replace('1000_1000_102400','');
          return `https://sakurazaka46.com/${item.src}`
        });
        // console.log(pics)
        pics.forEach( (pic,i) =>{
          
              https.get(pic,(res) => {
              // Image will be stored at this path
              const path = `${__dirname}/賀卡/${name+i}.jpeg`; 
              const filePath = fs.createWriteStream(path);
              res.pipe(filePath);
              filePath.on('finish',() => {
                  filePath.close();
                  console.log('Download Completed'); 
              })
          })

        });
      })
    });
});