// boilerplate for setting up Express and BodyParser
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

// create express app
var app = express();

// set up bodyparser functions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// added to make css folder accessible to handlebars
app.use(express.static('public'));

// set up handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// define an open port for http://flip3.engr.oregonstate.edu:24304/
app.set('port', 24304);

// SQL Queries
var dropTableQuery = 'DROP TABLE IF EXISTS workouts';
var createTableQuery = 'CREATE TABLE workouts(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, reps INT, weight INT, date DATE, lbs BOOLEAN)';
var selectQuery = 'SELECT id, name, reps, weight, DATE_FORMAT(date, "%m/%d/%Y") AS date, (CASE WHEN lbs <> 0 THEN "lbs" ELSE "kgs" END) AS lbs FROM workouts';
var insertQuery = 'INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)';
var deleteQuery = 'DELETE FROM workouts WHERE id = ';
var updateQuery = 'UPDATE workouts SET `name`=?, `reps`=?, `weight`=?, `date`=?, `lbs`=? WHERE `id`=?';

// RESET TABLE - navigating to this URL will drop and recreate the MySQL table (for testing)
app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query(dropTableQuery, function(err) { 
        mysql.pool.query(createTableQuery, function(err) {
            context.results = "Table reset";
            res.set('Content-Type', 'text/html');
            res.send(new Buffer('<h1>Table reset</h1>'));
        })
    });
});

// GET request - performs initial SELECT from database and renders app
app.get('/', function(req, res, next) {
    // SELECT query, contains SQL for modifying the date format and sending lbs/kgs depending on the boolean value stored
    mysql.pool.query(selectQuery, function(err, rows, fields) {
        if(err){
            next(err);
            return;
        }
        // create context object and add selected rows to object
		var context = {};
        context.selectRows = rows;
        // render the single page app with workout data from database
        res.render('home', context);
    });
});

// POST request - processes a request to INSERT a new row into the database and returns the updated rows to the client
app.post('/', function(req, res, next) {
    // INSERT query    
    mysql.pool.query(insertQuery, [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs], function(err, result) {
        if(err){
            next(err);
            return;
        }
        // SELECT query for returning modified table with new row
        mysql.pool.query(selectQuery, function(err, rows, fields) {
            if(err){
                next(err);
                return;
            }
            // send success code and updated database rows
            res.status(200);
            res.send(rows);
        });
    });
});

// DELETE request - removes the row from the database requested by the client
app.delete('/', function(req, res, next) {
    // DELETE query, append requested id to the end of the query to delete the row
    mysql.pool.query(deleteQuery + req.body.id, function(err, rows, fields) {
        if(err){
            next(err);
            return;
        }
        // SELECT query for returning modified table with row deleted
        mysql.pool.query(selectQuery, function(err, rows, fields) {
            if(err){
                next(err);
                return;
            }
            // send success code and updated database rows
            res.status(200);
            res.send(rows);
        });
    });
});

// PUT request - replaces a row with one updated by the user
app.put('/', function(req, res, next) {
    console.log(req.body.id);

    // UPDATE query
    mysql.pool.query(updateQuery, [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs, req.body.id], function(err, rows, fields) {
        if(err){
            next(err);
            return;
        }
        // SELECT query for returning modified table with row updated
        mysql.pool.query(selectQuery, function(err, rows, fields) {
            if(err){
                next(err);
                return;
            }
            // send success code and updated database rows
            res.status(200);
            res.send(rows);
        });
    });
});

// 404 boilerplate from lesson
app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});
    
// 500 error boilerplate from lesson
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500 - Server Error');
});

// create listener on selected port, boilerplate from lesson
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
    