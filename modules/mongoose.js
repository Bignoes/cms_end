var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/cms')

module.exports = mongoose