// 1.引入mongoose
// 2.设计schema
// 3.发布模型
var mongoose = require('./mongoose')
var getCurrentDate = require('./date')
var Schema = mongoose.Schema

mongoose.connect('mongodb://localhost/cms')

var userSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
        default: '/public/img/avatar-default.png'
    },
    create_time: {
        type: String,
        default: getCurrentDate.date
    },
    bio: {
        type: String,
        default: ''
    },
    birthday: {
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        enum: [-1, 0, 1],
        default: -1
    },
    status: {
        type: Number,
        // 0 无限制 
        // 1 限制评论
        // 2 限制登录
        enum: [0, 1, 2],
        default: 0
    }
})

module.exports = mongoose.model('User', userSchema)