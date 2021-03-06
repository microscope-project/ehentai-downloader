#!/usr/bin/env node
const fs = require('fs');
const yaml = require('js-yaml');
const CONFIG_FILE = require('path').normalize(`${__dirname}/../config.yml`);
const USER_CONFIG = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));
const downloadGallery = require('../index.js')(USER_CONFIG);

let [url, path = '.', range = undefined] = process.argv.slice(2);

if(url === '--config') {
  console.log(CONFIG_FILE);
  return 0;
}

if(range) {
    range = parseRangeString(range);
}

// 将"0,1,3-6"格式的范围字符串解析为[0,1,3,4,5,6]格式的数组
function parseRangeString(rangeStr) {
    range = [];
    for(let s of rangeStr.split(',')) {
        if(s.includes('-')) {
            let [l, r] = s.split('-');
            for(let i = +l; i <= +r; i++) {
                range.push(i);
            }
        } else {
            range.push(+s);
        }
    }
    return range;
}

downloadGallery(url, path, range).then(ev => {
    ev.on('download', info => {
        console.log(`${info.fileName} Download Success.`);
    });
    
    ev.on('done', _ => {
        console.log('done.');
    });
    
    ev.on('fail', (err, info) => {
        console.log(err, info);
    });
    
    ev.on('error', err => {
        console.error(err);
    });
}).catch(err => {
    console.error(err);
});