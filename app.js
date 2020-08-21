var express = require('express')
var path = require('path')
var router = require('./router')
var bodyParser = require('body-parser')
var session = require('express-session')
var cors = require("cors"); // 这个比较重要，解决跨域问题.npm install cors 装一下

var app = express()

app.engine('html', require('express-art-template'))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))
app.use('/public/', express.static(path.join(__dirname, './public/')))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors({

    origin: ['http://localhost:8080'], // 这是本地的默认地址和端口，vue启动的项目就是在这里，这样保证了等会我们在浏览器能访问服务器的数据（user.json）

    methods: ["GET", "POST", "PUT", "DELETE"],

    alloweHeaders: ["Content-Type", "Authorization"]

}))


app.use(session({
    // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
    // 目的是为了增加安全性，防止客户端恶意伪造
    secret: 'bignoes',
    resave: false,
    saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

app.use(router)

app.listen(3000, function() {
    console.log('Server is running in the port of 3000 ...');
})