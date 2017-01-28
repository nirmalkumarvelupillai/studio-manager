let express     = require('express');
let path        = require('path');
let app         = express(); 
let bodyParser  = require('body-parser');
let fs          = require('fs');
let db          = require('diskdb');
let _           = require('lodash');
let async       = require('async');

app.set('port', (process.env.PORT || 9000));

db.connect('data/', ['orders','users']); // connect db and load collection

// mongoose 4.3.x
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    "name":String,
    "username":String,
    "password":String,
    "token":String,
    "active":Boolean
});

let OrderSchema = new Schema({
    "token":String,
    "type":String,
    "date":String,
	"timestamp":Date,
	"category":String,
	"amount":Number,
    "items":[String],
	"for":String,
	"in":String,
	"by":String,
	"at":String
});

let Order = mongoose.model('Order',OrderSchema);
let User = mongoose.model('User',UserSchema);

// mongo db connection
let options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
let mongodbUri = 'mongodb://localhost:27017/NSAMPLE';
// let mongodbUri = ';

mongoose.connect(mongodbUri, options);
let conn = mongoose.connection;             
conn.on('error', console.error.bind(console, 'connection error:'));  
conn.once('open', function() {
  // Wait for the database connection to establish, then start the app.       
    bootstrapApp();
    // initDummyData();
}.bind(this));
// mongo db connection

// bootstrapApp(); //need to comment above mongo db code

function bootstrapApp(){
    console.log("Mongodb connection established...");   

    app.use(express.static(__dirname));
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.get('/', function(request, response) {
        response.sendFile(path.join(__dirname + '/index.html'));
    });

    let router = express.Router();  // get an instance of the express Router

    router.get('/order/list', (req, res) => {

        let aggs = [];
        agg_match = {};
        agg_match['$match'] =  {};
        agg_match['$match']['status'] = 'open';
        aggs.push(agg_match);

        agg_sort_date = {
            $sort:{
                timestamp:-1
            }
        };
        aggs.push(agg_sort_date);


        Order.aggregate(aggs, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }

            let responseData = {
                status:'success',
                payload:{
                    orders:result || []
                }
            };

            res.json(responseData);
            
        });

        

    });

    router.post('/order/add', function(req, res) {
        let order = new Order(req.body);
        order.save(function (err) {
            if (err) {
                // console.log("error");
                return console.error(err);
            }
            // console.log("activity saved!");
            // let result  = db.activity.save(req.body);
            res.json({"status":"success"});  
        });
 
    });

    router.post('/order/update',function(req, res){
        let order = req.body;
        let data = req.body;
        Order.update({_id:order._id},order,{multi:false,upsert:true},function(err,numaff){

            res.json({"status":"success","data":numaff}); 
        });

    });

    router.post('/order/delete',function(req, res){
        let data = req.body;
        Order.findByIdAndRemove(req.params.id || data._id, function (err, order) {  
            let response = {
                message: "success",
                id: order._id
            };
            res.send(response);
        });
    });

    router.post('/order/delete/:id',function(req, res){
        let data = req.body;
        Order.findByIdAndRemove(req.params.id || data._id, function (err, order) {  
            let response = {
                message: "success",
                id: order._id
            };
            res.send(response);
        });
    });

    app.use('/api',router);

    // middleware to redirect to index.html for any request for handle client side routing
    // app.use(function(request, response) {
    //   response.sendFile(path.join(__dirname + '/app/index.html'));
    // });

    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });
}
// Mongoose connection

function formatDate(date) {
  let mm = date.getMonth() + 1; // getMonth() is zero-based
  let dd = date.getDate();

  return [
            (dd>9 ? '' : '0') + dd,
            (mm>9 ? '' : '0') + mm,
            date.getFullYear()
        ].join('');
};
