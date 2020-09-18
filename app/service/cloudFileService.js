const { acquire } = require("../utils/access-token");
const request = require("request-promise");
function getFileById(token,id){
	let url = 'https://api.weixin.qq.com/tcb/batchdownloadfile?access_token='+ token;
	let body = {
		file_list: [{
			"fileid":decodeURIComponent(id),
			"max_age":7200
		}],
		env: 'subscribe-msg-cloud-1ffnt'
	}
	console.log('getFileById_body',token,id,body);

	return request({
		url: 'https://api.weixin.qq.com/tcb/batchdownloadfile?access_token='+ token,
		method: 'POST',
		json: true,
		body: body
	})
	.then(d => {
		console.log(d);
		if (d.errcode) {
			throw d;
		}
		return d;
	})
	.catch(e => {
		console.error(e);
		return "";
	});	
}
async function getFileByidAsync(id){
	let token = await acquire();
	let ret = await this.getFileById(token,id);
	return ret;
}
module.exports = {
	getFileById: getFileById,
	getFileByidAsync
}
