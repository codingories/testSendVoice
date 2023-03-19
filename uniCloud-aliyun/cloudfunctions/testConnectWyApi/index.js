'use strict';
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
console.log('path', path)
const uuid = require('uuid');
const YOUDAO_URL = 'https://openapi.youdao.com/iseapi';
const APP_KEY = '21cac69ccaa4c22e';
const APP_SECRET = '8J4OX4741lP6IAdKyuQUfNfPzPfYnuog';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	//返回数据给客户端
	
	function truncate(q) {
	  if (!q) {
	    return null;
	  }
	  const size = q.length;
	  return size <= 20 ? q : q.slice(0, 10) + size + q.slice(-10);
	}
	
	function encrypt(signStr) {
	  const hashAlgorithm = crypto.createHash('sha256');
	  hashAlgorithm.update(signStr, 'utf-8');
	  return hashAlgorithm.digest('hex');
	}
	
	function doRequest(data) {
	  const postData = new URLSearchParams(data).toString();
	  const options = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/x-www-form-urlencoded',
	      'Content-Length': postData.length,
	    },
	  };
		console.log('cccccc')
	  return new Promise((resolve, reject) => {
			console.log('gggxxx')
	    const req = https.request(YOUDAO_URL, options, (res) => {
				console.log('xxxxxaaa', res)
	      const chunks = [];
	      res.on('data', (chunk) => {
	        chunks.push(chunk);
	      });
	      res.on('end', () => {
	        const result = Buffer.concat(chunks);
	        resolve(result.toString());
	      });
	    });
			console.log('req rrr',req)
	    req.on('error', (err) => reject(err));
	    req.write(postData);
	    req.end();
	  });
	}
	
	async function connect() {
	  const audioFilePath = '/Users/ories/Downloads/projects/uniappLearn2/memo/p20-实战项目多角色留言板开发/p20-实战项目多角色留言板开发/guestbook/uniCloud-aliyun/cloudfunctions/testConnectWyApi/helloWorld.wav';
	  const langType = 'en';
	  const extension = path.extname(audioFilePath).slice(1);
		console.log('extension123456', extension)
	  if (extension !== 'wav') {
	    console.log('不支持的音频类型');
	    process.exit(1);
	  }
	  const wavInfo = fs.readFileSync(audioFilePath);
		console.log('wavInfo', wavInfo)
	  const sampleRate = new DataView(wavInfo.buffer, 24, 4).getUint32();
		console.log('sampleRate', sampleRate)
	  const numChannels = new DataView(wavInfo.buffer, 22, 2).getUint16();
		console.log('numChannels fuck', numChannels)
	  const q = fs.readFileSync(audioFilePath, { encoding: 'base64' });
		// console.log('qqqq', q)
	  const data = {};
	  data.text = 'Hello world';
	  const curTime = String(Math.floor(Date.now() / 1000));
	  data.curtime = curTime;
	  const salt = uuid.v1();
	  const signStr = APP_KEY + truncate(q) + salt + curTime + APP_SECRET;
	  const sign = encrypt(signStr);
	  data.appKey = APP_KEY;
	  data.q = q;
	  data.salt = salt;
	  data.sign = sign;
	  data.signType = 'v2';
	  data.langType = langType;
	  data.rate = 16000;
	  data.format = 'wav';
	  data.channel = 1;
	  data.type = 1;
		console.log('fuck data', data)
	  const response = await doRequest(data);
		console.log('gggggg')
		console.log('ttttttt', response)
	  // console.log('fuck response', response);
	}
	
	connect();
	return event
};
