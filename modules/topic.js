var mongoose = require('./mongoose')
var getCurrentDate = require('./date')
const { schema } = require('./user')

var Schema = mongoose.Schema

var topicSchema = new Schema({
    email: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
        require: true
    },
    create_time: {
        type: String,
        default: getCurrentDate.date
    },
    read_number: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('Topic', topicSchema)