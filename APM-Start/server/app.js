'use strict';

const koa = require('koa');
const serve = require('koa-static');
const router = require('koa-router')();
const koaBody = require('koa-body')();
const send = require('koa-send');
const json = require('koa-json');
const cors = require('koa-cors');
const monk = require('monk');
const wrap = require('co-monk');
const dotenv = require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
console.log('DB_HOST ', DB_HOST);
var mongo_url = DB_HOST; // mongodb://mongodb-instance-microservices:27017/TourOfHeroes
const db = monk(mongo_url);

// Generating the Mongdb database
const heroes = wrap(db.get('heroes'));
const counters = wrap(db.get('counters'));

const app = koa();
const origin_request_url = { "origin": "*" };



//middleware
app.use(cors(origin_request_url));
app.use(json());
app.use(router.routes());


console.log("init Data base...");
heroes.insert({ id: 11, name: "Mr. Nice" });
heroes.insert({ id: 12, name: "Narco" });
heroes.insert({ id: 13, name: "Bombasto" });
counters.insert({ "name": "heroes", "seq": 3 });



//utility functions
let getNextSequence = function* (name) {
  var ret = yield counters.findAndModify({ query: { name: name }, update: { $inc: { seq: 1 } }, new: true });
  return ret.seq;
}



//CRUD routes

//Create
router.post('/api/heroes', koaBody, function* () {
  this.body = yield heroes.insert({ id: yield getNextSequence('heroes'), name: this.request.body.name });
});

//Test api working
router.get('/api/test', function* () {
  this.body = "API is working!";
});

//Read
router.get('/api/heroes', function* () {
  // this.body = [{ id: "1", name: "Hello!" }];
  let result = { data: yield heroes.find({}, '-_id') };
  this.body = result.data;
});

//Read by id
router.get('/api/heroes/:id', function* () {
  let id = parseInt(this.params.id);
  let result = yield heroes.find({ id: id });
  if (result && result.length > 0)
    this.body = result[0];
  else
    this.body = {};
});

//Update
router.put('/api/heroes', koaBody, function* () {

  // let id = parseInt(this.params.id);
  let id = parseInt(this.request.body.id);
  let heroName = this.request.body.name;

  let selector = { 'id': id };
  let setter = { 'id': id, 'name': heroName };

  this.body = yield heroes.update(selector, setter);
});


//Delete
router.del('/api/heroes/:id', function* () {
  let id = parseInt(this.params.id);
  this.body = yield heroes.remove({ id: id });
});

//Search route
router.get('/api/heroes', koaBody, function* () {
  let regexStr = `.*${this.query.name}.*`;
  let result = yield heroes.find({ "name": { $regex: regexStr } });

  this.body = result.data;
});


//start listening...
app.listen(3333);
