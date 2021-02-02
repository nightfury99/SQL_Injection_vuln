var express = require('express');
var session = require('express-session');
var serverStatic = require('serve-static');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chinook.db');

var getIP = require('ipware')().get_ip;
var app = express();
var path = require('path');
const bodyParser = require('body-parser');
const { json } = require('express');
app.use(bodyParser.urlencoded({ extended: false }));

// Sessions are used by web applications to remember data about specific users.
// This is how when you login to a website, it remembers you for a while.
app.use(session({
	secret: 'some randomly generated secret',
	resave: true,
	saveUninitialized: true,
	cookie: {
		httpOnly: false,
		secure: false
	}
}));

//app.use(express.json());

// db.serialize(function() {
// 	//db.run("CREATE TABLE users (id INT, username TEXT, password TEXT)");
// 	var i = 0;
// 	var stmnt = db.prepare("INSERT INTO users VALUES (?, ?, ?)");
// 	db.all(`SELECT * FROM users`, (err, rows) => {
// 		i = rows.length+1;
// 		console.log(rows);
// 		stmnt.run(i, "Alice", "alice123");
		
// 		stmnt.finalize();
// 	});
// });


app.use(function(req, res, next) {
	// Allows CORS requests:
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.get('/logout', (req, res) => {
	req.session.destroy();
	res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.get('/profile', (req, res) => {
	if(req.session.login === true) {
		res.sendFile(path.join(__dirname + '/public/profile.html'));
	}else {
		res.sendFile(path.join(__dirname + '/public/login.html'));
	}
});

app.get('/index', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/login/api', (req, res) => {
	// res.send('asdasdasdasdas');
	console.log("cccccccc");
});

// var name = "' or 1=1 --";

// db.all("SELECT * FROM users WHERE username = '" + name +"'", (err, rows) => {
// 	rows.forEach((row) => {
// 		console.log("success");
// 	});
// });

app.post('/login', (req, res) => {
	var ipInfo = getIP(req);
	console.log("This ip is trying: " + ipInfo.clientIp);
	console.log(req.body.username, req.body.password);
	
	db.all(`SELECT * FROM users WHERE username = '${req.body.username || ''}' AND password = '${req.body.password || ''}'`, (err, rows) => {
		if(err === null){
			rows.forEach((row) => {
				req.session.login = true;
				req.session.user_id = row.id;
				res.redirect('http://localhost:3000/profile')
			});
		}else {
			console.log("err: " + err);
		}
	});
	res.sendFile(path.join(__dirname + '/public/login.html'));
	
	//res.end();
});



// This serves the index.html file to the browser.
app.use(serverStatic(__dirname + '/public'));


// Start listening to requests on the local machine at port 3000.
app.listen(3000, function() {
	console.log('Server listening at localhost:3000');
});
