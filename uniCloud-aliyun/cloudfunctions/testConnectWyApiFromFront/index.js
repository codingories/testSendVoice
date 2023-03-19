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
		console.log('doRequest fuck data', data)
	  const postData = new URLSearchParams(data).toString();
	  const options = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/x-www-form-urlencoded',
	      'Content-Length': postData.length,
	    },
	  };
	  return new Promise((resolve, reject) => {
	    const req = https.request(YOUDAO_URL, options, (res) => {
	      const chunks = [];
	      res.on('data', (chunk) => {
	        chunks.push(chunk);
	      });
	      res.on('end', () => {
	        const result = Buffer.concat(chunks);
	        resolve(result.toString());
	      });
	    });
	    req.on('error', (err) => reject(err));
	    req.write(postData);
	    req.end();
	  });
	}
	
	function arrayBufferToBase64(buffer) {
		const binary = Buffer.from(buffer).toString("base64");
		return binary;
	}

	
	let q = event.q
	let text = event.text
	async function connect(q, text) {
	  const langType = 'en';
	 console.log('fuck qqq', q)
	  const data = {};
	  data.text = text;
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
	  console.log('fuck response', response);
		return response
	}
	
	let result = await connect(q, text);
	return JSON.parse(result)
	

};
