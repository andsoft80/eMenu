/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
///////base set//////////////////////////////
var mySqlHost = '185.220.35.146';
var http = require("http");
var fs = require('fs');
var util = require('util');
var url = require('url');
var port = 3000;
var mysql = require('mysql');
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var cors = require('cors');
app.use(express.static('static'));
app.use(express.static('images'));
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var mailer = require("nodemailer");
var smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
        user: "andsoft80@gmail.com",
        pass: "Professional666"
    }
});
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var secret = 'death666';
/////////////////////////////////////////////////////

//var con = mysql.createConnection({
//    host: '192.168.0.18',
//    user: 'remote',
//    password: 'remote',
//    database: "tss"
//});

var con = mysql.createConnection({
    host: mySqlHost,
    user: 'user',
    password: 'user',
    database: "karplay"
});
var mySqlConnect = function () {
    con.on('error', function (err) {

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {



            console.log("MySQL lost connection. Reconnect...");

            con = mysql.createConnection({
                host: mySqlHost,
                user: "user",
                password: "user",
                database: "karplay"
            });
            con.connect(function (err) {
                if (err)
                    throw err;
                console.log("Connected!");
            });
            mySqlConnect();
        }



    });
};
mySqlConnect();

var sessionStore = new MySQLStore({

    clearExpired: true,
    // How frequently expired sessions will be cleared; milliseconds:
    checkExpirationInterval: 20000000,
    // The maximum age of a valid session; milliseconds:
    expiration: 86400000
}/* session store options */, con);

app.use(session({
    key: 'emenu',
    secret: 'death666',
    store: sessionStore,
    resave: false,
    saveUninitialized: false

}));

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: false})); // to support URL-encoded bodies
app.use(cors());
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to MySql database!");

});

app.listen(port, function () {
    console.log('Start : localhost: ' + port);
});

/////////////universal api//////////////////////////////////
app.post('/table/:tableName/action/:action', function (req, res) {
    var tableName = req.params.tableName;
    var action = req.params.action;

    if (action === 'post') {
        sqlStr = "INSERT INTO " + tableName + " (";
        for (i = 0; i < Object.keys(req.body).length; i++) {
            sqlStr = sqlStr + Object.keys(req.body)[i] + ",";
        }
        sqlStr = sqlStr.substring(0, sqlStr.length - 1);
        sqlStr = sqlStr + ") VALUES (";
        for (i = 0; i < Object.keys(req.body).length; i++) {
            sqlStr = sqlStr + "'" + req.body[Object.keys(req.body)[i]] + "',";
        }
        sqlStr = sqlStr.substring(0, sqlStr.length - 1);
        sqlStr = sqlStr + ")";

        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));
            res.end(JSON.stringify(result));

        });
    }
    if (action === 'put') {
        var id = req.body.id;
        sqlStr = "update " + tableName + " set ";
        for (i = 0; i < Object.keys(req.body).length; i++) {
            if (Object.keys(req.body)[i] === 'id') {
                continue;
            }
            sqlStr = sqlStr + Object.keys(req.body)[i] + "='" + req.body[Object.keys(req.body)[i]] + "',"
        }
        sqlStr = sqlStr.substring(0, sqlStr.length - 1);
        sqlStr = sqlStr + "where id = " + id;

        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));
            res.end(JSON.stringify(result));

        });
    }

    if (action === 'delete') {
        var id = req.body.id;
        sqlStr = "delete from " + tableName + " where id =  " + id;

        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));
            res.end(JSON.stringify(result));

        });


    }
    if (action === 'get') {

        var id = req.body.id;
        var condition = req.body.condition;

        var str = '';
        if (condition) {

            str = "where " + condition[0].field + " = '" + condition[0].value + "'";
            for (i = 1; i < condition.length; i++) {
                str = str + ' and ' + condition[i].field + " = '" + condition[i].value + "'";
            }
        }
        if (id) {
            sqlStr = "select * from " + tableName + " where id =  " + id + " " + str;
        } else {
            sqlStr = "select * from " + tableName + " " + str;
        }


        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));
            res.end(JSON.stringify(result));

        });


    }
    if (action === 'get_columns') {//webix format
        

        sqlStr = "DESC " + tableName;
        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));



            //console.log(JSON.stringify(columns));
            res.end(JSON.stringify(result));

        });


    }


});

//////////////////////////////////////////////

//Тестирование загрузки файла

app.get('/upload', function (req, res) {
    var myReadStream = fs.createReadStream('uploadfile.html', 'utf8');
    myReadStream.pipe(res);

});

//Загрузка файла в папку uploads
app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    res.end(req.file.filename);
});
app.post("/adduser", function (request, response) {

    var email = request.body.email;
    var name = request.body.name;
    var pwd = request.body.pwd;
    parcel = {};

    var hash = bcrypt.hashSync(pwd, salt);
    var sql = "insert into users (email, name, pwd) values ('" + email + "','" + name + "','" + hash + "')";
    con.query(sql, function (err, result) {
        if (err) {
            parcel.err = err;

        } else {
            parcel.auth = 'ok';
        }

        response.write(JSON.stringify(parcel));
        response.end();
    });


});
app.post("/checkuser", function (request, response) {
    var parcel = {"auth": ""};
    var email = request.body.email;
    var pwd = request.body.pwd;

    var sql = "select * from users where email = '" + email + "'";
    con.query(sql, function (err, result) {
        if (err)
            throw err;

        if (result.length === 0) {
            parcel.auth = 'notusr';
        } else {
            var hash = result[0].pwd;
            if (bcrypt.compareSync(pwd, hash)) {
                parcel.auth = 'ok';
                parcel.name = result[0].name;
                parcel.signature = bcrypt.hashSync(secret + result[0].email, salt);
                request.session.user = result[0].email;
                request.session.name = result[0].name;
            } else {
                parcel.auth = 'notpass';
            }
        }
        response.write(JSON.stringify(parcel));
        response.end();
    });

});

app.post("/recover", function (request, response) {
    var parcel = {};
    var email = request.body.email;
    var newPwd = 'temppass' + Math.floor(Math.random() * 1000);

    var sql = "select * from users where email = '" + email + "'";
    con.query(sql, function (err, result) {
        if (err)
            throw err;

        if (result.length === 0) {
            parcel.auth = 'notusr';
        } else {
            var mail = {
                from: "eMenu(not reply)",
                to: email,
                subject: "Восстановление пароля",
                text: "Ваш новый пароль : " + newPwd

            };

            smtpTransport.sendMail(mail, function (error, res) {
                if (error) {
                    console.log(error);
                } else {
                    var sql = "update users  set pwd ='" + bcrypt.hashSync(newPwd, salt) + "' where email = '" + email + "'";
                    con.query(sql, function (err, result) {
                        if (err)
                            throw err;
                    });
                }

                smtpTransport.close();
            });

            parcel.auth = 'ok';



        }
        response.write(JSON.stringify(parcel));
        response.end();
    });

});
app.post("/getauth", function (request, response) {
    var parcel = {};
    var curruser = request.session.user;
    if (typeof curruser !== 'undefined') {
        parcel.email = request.session.user;
        parcel.name = request.session.name;
    } else {
        parcel.email = 'empty';
        parcel.name = 'empty';
    }
    response.write(JSON.stringify(parcel));
    response.end();

});



