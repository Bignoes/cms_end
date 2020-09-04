var express = require('express')

var path = require('path')
var fs = require("fs")

const md5 = require('blueimp-md5') //加密插件

const User = require('./modules/user')
const Topic = require('./modules/topic')
const Comment = require('./modules/comment')
const { log } = require('util')
const topic = require('./modules/topic')

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
router.post('/user', function(req, res) {
    var body = req.body

    // 对密码进行 md5 重复加密
    body.password = md5(md5(body.password))

    // 创建用户，执行注册
    new User(body).save(function(error, user) {
        if (error) {
            return res.status(500).json({
                err_code: 500
            })
        }
        res.status(200).json({
            err_code: 0,
            user
        })
    })
})


// 修改资料
router.put('/user', function(req, res) {
    var body = req.body

    if (body.password) {
        body.password = md5(md5(body.password))
    }

    if (body.nickname) {

        Topic.update({ email: body.email }, { nickname: body.nickname }, { multi: true }, function(error) {
            if (error) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Server error...'
                })
            }
        })
        Comment.update({ email: body.email }, { nickname: body.nickname }, { multi: true }, function(error) {
            if (error) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Server error...'
                })
            }
        })
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

    //按条件查询,查询单个按创建时间查询，查询多个按邮箱查询
    if (body.read_number != undefined) {
        return Topic.findOneAndUpdate(body, { $set: { read_number: parseInt(body.read_number) + 1 } }, function(error, topics) {
            if (error) {
                return res.status(500).json({
                    err_code: 500,
                })
            }
            res.status(200).json({
                err_code: 0,
                topics: [topics],
            })
        })
    }

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

    new Comment(body).save(function(error, comment) {
        if (error) {
            return res.status(500).json({
                err_code: 500
            })
        }
        console.log(comment);
        res.status(200).json({
            err_code: 0,
            comment,
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


module.exports = router
