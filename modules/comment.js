// 1.引入mongoose
// 2.连接数据库
// 2.设计schema
// 3.发布模型
var mongoose = require('./mongoose')
var getCurrentDate = require('./date')

var Schema = mongoose.Schema

var commentSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    modify_time: {
        type: String,
        default: getCurrentDate.date
    },
    content: {
        type: String,
        require: true
    },
    topicId: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('Comment', commentSchema)