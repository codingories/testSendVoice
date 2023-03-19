<template>
	<view>
		<unicloud-db :where="where" 
		ref="udb"
		v-slot:default="{data, loading, error, options}" collection="guestbook,uni-id-users" field="_id,text,state,user_id.nickname,user_id.avatar_file,user_id._id">
			<view v-if="error">{{error.message}}</view>
			<view v-else>
				<view v-for="(item, index) in data" :key="index" class="item">
					<view class="main">
						<view class="nickname">{{item.user_id[0].nickname}}</view>
						<text>{{item.text}}</text>
					</view>
					<!-- <text>{{item.state?'审核通过':'审核中'}}</text> -->
					<button @click="changeType">
						{{item.state?'审核通过':'审核中'}}
					</button>
				</view>
			
			</view>
		</unicloud-db>
		<button @click="add">添加</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		computed: {
			where() {
				if(this.uniIDHasRole('ADUITOR')) {
					return ''
				} else {
					return "state == true || user_id._id == $cloudEnv_uid" 
				} 
			}
		},
		methods: {
			add() {
				// cdb 拿到数据表的操作对象
				const db = uniCloud.database();
				// 指定操作的是哪一张表
				const guestbookTable = db.collection('guestbook')
				// 添加一条数据
				guestbookTable.add({
					"text": "这是第一条数据",
					// "state": false,
					// "user_id": "123456"
				}) 
			},
			changeType() {
				this.$refs.udb.update(item._id, {state: item.state}, {
					complete: e=>{
						console.log(e)
						this.$refs.udb.refresh()
					}
				})
			}
		}
	}
</script>

<style>

</style>
