var express = require('express');
var app = express();
var multer = require('multer');
var path = require('path');


var upload = multer({
    dest: 'static/upload/'
});

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/upload', upload, function(req, res, next) {
    res.send(req.files);
});


app.listen(3000);
