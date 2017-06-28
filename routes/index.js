var express = require('express');
var mongodb = require('mongoose');
mongodb.connect("mongodb://127.0.0.1:27017/admin",function(err){
	if(!err){
		console.log('数据库已连接...');
	}
});

var router = express.Router();

var schema=mongodb.Schema;
var adminSchema=new schema({
	username:String,
	password:String,
	truename:String,
	role:String,
	department:String,
	flag:Number,
	sort:Number
});
var logSchema=new schema({
	username:String,
	content:String,
	op_time:String,
	result:String,
	ip:String
});
var adminModel=mongodb.model('login',adminSchema,'login');
var logModel=mongodb.model('log',logSchema,'log');
//GET home page. 
router.post('/checklogin.html',function(req,res){
	var username=req.body.username;
	var password=req.body.password;
	res.cookie('login_user',username);
	//adminModel.find({'username':username,'password':password},function(err,data){
		//if(username=='aaaaa'&&password==123456){
			res.send('1');
		//}else{
			//res.send('0');
		//}
	//})
})
router.get('/pages/checklogined.html',function(req,res){
	if(req.cookies.login_user){
		res.send('1');
	}else{
		res.send('alert("还没有登录，请登录后再操作");location.href="/pages/login.html"');
	}
})
router.get('/outsystem.html',function(req,res){
	res.cookie('login_user','');
	res.send("<script>location.href='/pages/login.html'</script>");
})


router.get('/showadmin.html',function(req,res){
	var branch=3;//每页显示的数据条数
	var page=req.query.page;//当前在哪一页
	adminModel.find({},function(err,data){
		var datalength=data.length;
		var pagecount=Math.ceil(datalength/branch);//总页数
		adminModel.find({},function(err,data){
			data.push(datalength);
			data.push(pagecount);
			res.send(data);
		}).limit(branch).skip(branch*(page-1));
	});
})


router.post('/deladmin.html',function(req,res){
	var ids=req.body['ids[]'];
	adminModel.find({'_id':{$in:ids}},function(err,data){
		for(var i in data){
			data[i].remove();
		}
		res.send('1');
	})
})
router.post('/addadmin.html',function(req,res){
	var username=req.body.username;
	var password=req.body.password;
	var truename=req.body.truename;
	var role=req.body.role;
	var department=req.body.department;
	var flag=parseInt(req.body.flag);
	var sort=parseInt(req.body.sort);
	var admin=new adminModel({
		'username':username,
		'password':password,
		'truename':truename,
		'role':role,
		'department':department,
		'flag':flag,
		'sort':sort
	});
	admin.save(function(err){
		var log=new logModel({
			'username':req.cookies.login_user,
			'content':'新增一个管理员:'+req.body.username,
			'op_time':(new Date()).toLocaleString(),
			'result':'成功',
			'ip':req.ip
		});
		log.save(function(err){
			if(!err){
				adminModel.find({},function(err,data){
					res.send(data);
				})
			}
		})
		
	})
})
router.get('/editbar.html',function(req,res){
	var id=req.query.id;
	adminModel.find({'_id':id},function(err,data){
		res.send(data);
	})
})
router.post('/editadmin.html',function(req,res){
	var _id=req.body.id;
	var username=req.body.username;
	var password=req.body.password;
	var truename=req.body.truename;
	var role=req.body.role;
	var department=req.body.department;
	var flag=parseInt(req.body.flag);
	var sort=parseInt(req.body.sort);
	adminModel.findById(_id,function(err,data){
		  data.username = username;
		  data.password = password;
		  data.truename = truename;
		  data.role = role;
		  data.department = department;
		  data.flag = flag;
		  data.sort = sort;
		  
		  data.save(function(err){
		  	if(err){
				res.send(err);
			}else{
				res.send('1');
			}
		  });
	});
})
router.post('/search.html',function(req,res){
	var data=req.body;
	adminModel.find(data,function(err,data){
		data.push(1);
		data.push(2);
		if(!err){
			res.send(data);
		}else{
			res.send(err);
		}
	})
})
router.get('/get_log.html',function(req,res){
	logModel.find({},function(err,data){
		res.send(data);
	})
})
router.post('/editpassword.html',function(req,res){
	var oddpwd=req.body.oddpwd;
	var newpwd=req.body.newpwd;
	var username=req.cookies.login_user;
	adminModel.find({'username':username,'password':oddpwd},function(err,data){
		for(var i in data){
			if(oddpwd===data[i].password){
				adminModel.update({'_id':data[i]._id},{$set:{'password':newpwd}},function(err){
					res.clearCookie('login_user');
					res.send('1');
				})
			}else{
				res.send('2');
			}
		}
		
	})
})
router.get('/checkusername.html',function(req,res){
	var username=req.query.username;
	adminModel.find({'username':username},function(err,data){
		if (data.length==0) {
			res.send('1');
		} else{
			res.send('0');
		}
	})
})
















module.exports = router;
