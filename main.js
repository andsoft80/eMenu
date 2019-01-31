/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
///////base set//////////////////////////////
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
/////////////////////////////////////////////////////

//var con = mysql.createConnection({
//    host: '192.168.0.18',
//    user: 'remote',
//    password: 'remote',
//    database: "tss"
//});

var con = mysql.createConnection({
    host: '185.220.35.146',
    user: 'user',
    password: 'user',
    database: "emenu"
});

app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(cors());
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to MySql database!");

});

app.listen(3000, function () {
    console.log('Start : localhost:3000');
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
            
            str = "where " + condition[0].field + " = '" + condition[0].value +"'";
            for (i = 1; i < condition.length; i++) {
                str = str + ' and ' + condition[i].field + " = '" + condition[i].value+"'";
            }
        }
        if (id) {
            sqlStr = "select * from " + tableName + " where id =  " + id +" "+str;
        } else {
            sqlStr = "select * from " + tableName +" "+str;
        }


        con.query(sqlStr, function (err, result) {
            if (err)
                res.end(JSON.stringify(err));
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
})




