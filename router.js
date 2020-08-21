var express = require('express')

var formidable = require('formidable'); //上传功能的插件
var path = require('path')
var fs = require("fs")

const md5 = require('blueimp-md5') //加密插件

const User = require('./modules/user')
const Topic = require('./modules/topic')
const Comment = require('./modules/comment')

var router = express.Router()

/*****************    用户资源     ***************/

// 处理登录数据
router.get('/user', function(req, res) {

    const body = req.query

    if (body.password) {
        body.password = md5(md5(body.password))
    }

    User.findOne(body, function(error, user) {
        if (error) {
            return res.status(500).json({
                err_code: 500,
            })
        }
        if (!user) {
            return res.status(200).json({
                err_code: 1,
            })
        }
        res.status(200).json({
            err_code: 0,
            user,
        })
    })



})

// 处理注册数据
router.post('/user', async function(req, res) {
    var body = req.body
    try {
        if (await User.findOne({ email: body.email })) {
            return res.status(200).json({
                err_code: 1,
                message: '邮箱已存在'
            })
        }
        if (await User.findOne({ nickname: body.nickname })) {
            return res.status(200).json({
                err_code: 2,
                message: '昵称已存在'
            })
        }
        // 对密码进行 md5 重复加密
        body.password = md5(md5(body.password))

        // 创建用户，执行注册
        await new User(body).save()
        req.session.user = new User(body)
        res.status(200).json({
            err_code: 0,
            user: body
        })
    } catch (err) {
        return res.status(500).json({
            err_code: 500,
            message: err.message
        })
    }
})

// 修改资料
router.put('/user', function(req, res) {
    var body = req.body

    if (body.password) {
        body.password = md5(md5(body.password))
    }

    User.findOneAndUpdate({ email: body.email }, body, function(error, data) {
        if (error) {
            return res.status(500).json({
                err_code: 500,
                message: 'Server error...'
            })
        }

        return res.status(200).json({
            err_code: 0,
            user: body
        })
    })
})

//注销账号
router.delete('/user', function(req, res) {
    User.findOneAndRemove(req.body, function(error) {
        if (error) {
            return res.status(500)
        }
        res.status(200).json({
            err_code: 0
        })
    })
})


/*****************    话题资源     ***************/


// 读取topic
router.get('/topic', function(req, res) {

    const body = req.query

    //查询所有topic
    if (JSON.stringify(body) == "{}") {
        return Topic.find(function(error, topics) {
            if (error) {
                return res.status(500).json({
                    err_code: 500,
                })
            }
            res.status(200).json({
                err_code: 0,
                topics,
            })
        })
    }

    //按条件查询
    Topic.find(body, function(error, topics) {
        if (error) {
            return res.status(500).json({
                err_code: 500,
            })
        }
        res.status(200).json({
            err_code: 0,
            topics,
        })
    })

})

// 新话题数据
router.post('/topic', function(req, res) {

    var body = req.body

    new Topic(body).save(function(error, data) {
        if (error) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0
        })
    })

})

//更新数据
router.put('/topic', function(req, res) {
    Topic.findOneAndUpdate(req.body, function(err) {
        if (err) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0
        })
    })
})

//删除topic
router.delete('/topic', function(req, res) {
    Topic.findOneAndRemove(req.body, function(err) {
        if (err) {
            return res.status(500).json({
                err_code: 500
            })
        }
    })
    Comment.remove({ topicId: req.body.create_time }, function(err) {
        if (err) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0
        })
    })
})


/*****************    评论资源     ***************/

//获取评论
//有两种方式，一是查询所有满足参数条件的数据，第二种方式，没有参数则查询全部
router.get('/comment', function(req, res) {

    const body = req.query

    //按条件查询
    Comment.find(body, function(error, comments) {
        if (error) {
            return res.status(500).json({
                err_code: 500,
            })
        }
        res.status(200).json({
            err_code: 0,
            comments,
        })
    })
})

// 发布评论
//数据要求：邮箱和评论内容
router.post('/comment', function(req, res) {

    var body = req.body

    new Comment(body).save(function(error, data) {
        if (error) {
            return res.status(500).json({
                err_code: 500
            })
        }

        res.status(200).json({
            err_code: 0
        })
    })

})

//更新数据
//只是预留了接口，但是不建议添加修改评论的业务
router.put('/comment', function(req, res) {
    Comment.findOneAndUpdate(req.body, function(err) {
        if (err) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0
        })
    })
})

//删除评论
//只有两个用户能删除评论，1.发布这条评论的用户，2.评论所在文章的用户
router.delete('/comment', function(req, res) {
    Comment.findOneAndRemove(req.body, function(err) {
        if (err) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0
        })
    })
})

var formidable = require('formidable'); //上传功能的插件
var path = require('path')
var fs = require("fs");
const { log } = require('util');
const comment = require('./modules/comment');

//上传头像
router.post('/image', (req, res, next) => {
    //上传文件只能通过这个插件接收  file是上传文件 fields是其他的
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../../static/'); //文件保存的临时目录为static文件夹（文件夹不存在会报错，一会接受的file中的path就是这个）
    form.maxFieldsSize = 1 * 1024 * 1024; //用户头像大小限制为最大1M    
    form.keepExtensions = true; //使用文件的原扩展名  
    form.parse(req, function(err, fields, file) {
        var filePath = '';
        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。  
        if (file.tmpFile) {
            filePath = file.tmpFile.path;
        } else {
            for (var key in file) {
                if (file[key].path && filePath === '') {
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移动的目录文件夹，不存在时创建目标文件夹  
        var targetDir = path.join(__dirname, '../../static/uploads');
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.'));
        //判断文件类型是否允许上传  
        if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
            var err = new Error('此文件类型不允许上传');
            res.json({
                code: -1,
                message: '此文件类型不允许上传'
            });
        } else {
            //以当前时间戳对上传文件进行重命名  
            var fileName = new Date().getTime() + fileExt;
            var targetFile = path.join(targetDir, fileName);
            //移动文件  
            fs.rename(filePath, targetFile, function(err) {
                if (err) {
                    console.info(err);
                    res.json({
                        code: -1,
                        message: '操作失败'
                    });
                } else {
                    User.update({
                        username: req.cookies.username
                    }, {
                        avatar: fileName
                    }, (err2, doc2) => {

                        //上传成功，返回文件的相对路径  
                        // var fileUrl = '/static/upload/' + fileName;
                        res.json({
                            code: 0,
                            fileUrl: fileName
                        });
                    })

                }
            });
        }
    });
})

module.exports = router