<template>
  <view>
    <button @touchstart="startRecord" @touchend="stopRecord">{{ recordButtonText }}</button>
		{{tempFilePath}}
	<button v-if="tempFilePath" @tap="uploadFile">上传录音</button>
	    <button v-if="tempFilePath" @tap="playRecord">播放录音</button>

	<uni-easyinput v-model="text"></uni-easyinput>
	pronunciation: {{pronunciation}}
	句子流利度:
	{{fluency}}
	句子综合评分:
	{{overall}}
	errorCode:
	{{errorCode}}
  </view>
</template>

<script>
// import { Base64 } from 'js-base64';
	
export default {
  data() {
    return {
      recordButtonText: '按住开始录音',
      recorderManager: null,
      recording: false,
      tempFilePath: '',
			text: "Hello world",
			fluency: '',
			overall: '',
			errorCode: '',
			pronunciation: ''
    }
  },
  methods: {
		 playRecord() {
		    const innerAudioContext = uni.createInnerAudioContext()
		    innerAudioContext.src = this.tempFilePath
		    innerAudioContext.play()
		  },
    startRecord() {
			console.log('this.recorderManager', this.recorderManager)
      this.recorderManager.start({
				format: 'wav',
				sampleRate: 16000,
				numberOfChannels: 1,
      })
      this.recording = true
      this.recordButtonText = '正在录音'
    },
    stopRecord() {
      this.recorderManager.stop()
      this.recording = false
      this.recordButtonText = '按住开始录音'
    },
		uploadFile() {
				this.sendData()
			},
		
			sendData() {
				console.log('fuck sendData', this.tempFilePath)
				const fileManager = uni.getFileSystemManager()
				let that = this
				let text = this.text
				uni.request({
				  url: this.tempFilePath,
					responseType: "arraybuffer",
				  method: 'GET',
				  success: function(res) {
				    // 将成功获取到的数据发送到后台
						console.log('res uni request', res)
						console.log(typeof res.data)
						console.log('res.data', res.data)
						console.log(`{q: res.data, text: text}`, {q: res.data, text: text})
						uniCloud.callFunction({name: "testConnectWyApiFromFront", data:{q: uni.arrayBufferToBase64(res.data), text: text}}).then(
							(res) => {
								console.log('rest123', res.result)
								// let result = res.result
								let result = res.result
								console.log('result', result)
								that.pronunciation = result.pronunciation
								that.fluency = result.fluency
								that.overall = result.overall
								that.errorCode = result.errorCode
								that.parentIdOptions = result.data
							},
							fail=>{
								console.log('fail', fail)
							}
						)
					}
				})
			},
			arrayBufferToBase64(buffer) {
			  var binary = '';
			  var bytes = new Uint8Array(buffer);
			  var len = bytes.byteLength;
			  for (var i = 0; i < len; i++) {
			    binary += String.fromCharCode(bytes[i]);
			  }
			  return Base64.encode(binary);
			},
			base64ToArrayBuffer(base64) {
			  const binaryString = window.atob(base64)
			  const len = binaryString.length
			  const bytes = new Uint8Array(len)
			  for (let i = 0; i < len; i++) {
			    bytes[i] = binaryString.charCodeAt(i)
			  }
			  return bytes.buffer
			}
  },
  onLoad() {
		console.log(`uni.getRecorderManager()`, uni.getRecorderManager())
    this.recorderManager = uni.getRecorderManager()
		console.log('fuck this.recorderManager', this.recorderManager)
    this.recorderManager.onStop((res) => {
			console.log('fuck stop111', res)
      this.tempFilePath = res.tempFilePath
      uni.showToast({
        title: '录音完成',
        icon: 'none'
      })
    })
  },
	
}
</script>