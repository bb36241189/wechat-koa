const mysql = require('mysql')
// 连接 mysql
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'ct',
	password: 'LJd6GhAjD4cAKmyY',
	database: 'Customer'
});
const connectionQa = mysql.createConnection({
	host: 'localhost',
	user: 'tarotQestion',
	password: 'y7RpSSHCfiHfELWw',
	database: 'tarotQestion'
});

module.exports = {
	selectAll(){
		return new Promise((r,j) => {
			connection.query('SELECT * FROM `feeling_code`', (err, results, fields) => {
				if (err){
					j(err)
				}else{
					r(results)
				} 

			})
		})
	},
	getCodeByOrderNo(order_no){
		return new Promise((r,j) => {
			connection.query('SELECT * FROM feeling_code WHERE order_no = ? ', [order_no], function (error, results, fields) {
				if (error){
					j(error);
				}else{
					r(results);
				}
			});
		});
	},
	judgeHasCode(code){
		return new Promise((r,j) => {
			connection.query('SELECT * FROM feeling_code WHERE id = ? ', [code], function (error, results, fields) {
				if (error){
					j(error);
				}else{
					if(results.length){
						r(true);
					}else{
						r(false);
					}
				}
			});
		});

	},
	buildOneCode(order_no,dayNum,mealName){
		return new Promise((r,j) => {
			var post  = {
				order_no,
				starttime: Date.now(),
				endtime: Date.now() + dayNum * 24 * 60 * 60 * 1000,
				meal_name: mealName || ''
			};
			console.log('buildOneCode',post);
			var query = connection.query('INSERT INTO feeling_code SET ?', post, function (error, results, fields) {
				if (error){
					j(error)
				}else{
					r([results,post]);
				} 
				// Neat!
			});
		});
	},
	judgeIsUsed(code){
		return new Promise((r,j) => {
			connection.query('SELECT * FROM feeling_code WHERE id = ? AND used = 1', [code], function (error, results, fields) {
				if (error){
					j(error);
				}else{
					if(results.length > 0){
						r(true);
					}else{
						r(false);
					}
				}
			});
		})
	},
	judgeIsUserGeted(openid){
		return new Promise((r,j) => {
			connection.query('SELECT * FROM feeling_code WHERE openid = ? AND endtime NOT BETWEEN ? AND ?', [openid,0,Date.now()], function (error, results, fields) {
				if (error){
					j(error);
				}else{
					if(results.length > 0){
						r(true);
					}else{
						r(false);
					}
				}
			});
		});
	},
	updateOpenidByCode(code,openid){
		return new Promise((r,j) => {
			connection.query('UPDATE feeling_code SET openid = ?, used = ? WHERE id = ?', [openid,true,code ], function (error, results, fields) {
				if (error){
					j(error);
				}else{
					r(results);
				}
			});
		});
	},
	saveQa(qa_from,question,prev,now,next){
		let post = {
			qa_from,
			question,
			prev,
			now,
			next,
			qa_starttime: Date.now(),
		}
		return new Promise((r,j) => {
			var query = connectionQa.query('INSERT INTO qa SET ?', post, function (error, results, fields) {
				if (error){
					j(error)
				}else{
					r([results,post]);
				}
				// Neat!
			});

		});
	},
	queryQa(has_audio){
		return new Promise((r,j) => {
			connectionQa.query('SELECT * FROM `qa` where qa_audio is null', (err, results, fields) => {
				if (err){
					j(err)
				}else{
					r(results)
				}

			})
		});
	},
	udpateQa(order_no,qa_audio,qa_to){
		return new Promise((r,j) => {
                        connectionQa.query('UPDATE qa SET qa_audio = ?, qa_answertime = ?,qa_to = ? WHERE qa_from = ?', [qa_audio,Date.now(),qa_to,order_no], function (error, results, fields) {
                                if (error){
                                        j(error);
                                }else{
                                        r(results);
                                }
                        });
                });		
	},
	queryQaByOrderNo(order_no){
		return new Promise((r,j) => {
                        connectionQa.query('SELECT * FROM `qa` where qa_from = ?',[order_no], (err, results, fields) => {
                                if (err){
                                        j(err)
                                }else{
                                        r(results)
                                }

                        })
                });
	}
}
