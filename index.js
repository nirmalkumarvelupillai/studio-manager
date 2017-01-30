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
    "cust_name":String,
    "cust_mobile":String,
    "cust_address":String,
    "func_type":String,
    "func_date":Date,
    "func_venue":String,
    "estimation":Number,
    "advance_paid":Number,
    "order_status":String
});

let Order = mongoose.model('Order',OrderSchema);
let User = mongoose.model('User',UserSchema);

// mongo db connection
let options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
// let mongodbUri = 'mongodb://localhost:27017/NSAMPLE';
let mongodbUri = 'mongodb://heroku_0j37gz6c:g4304s73j9m2ana1epdh83o06i@ds137759.mlab.com:37759/heroku_0j37gz6c';

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

    router.get('/order/customer/list', (req, res) => {
        Order.find().select('cust_name').exec((err, customers) => {
            if (err) return console.error(err);
            let customers_arr = _.chain(customers).map('cust_name').uniq().sort().value();
            res.json(customers_arr || []);
        })
    });

    router.get('/order/list', (req, res) => {
        let order_status = req.query.order_status;
        let order_date = req.query.order_date;
        let cust_name = req.query.cust_name;
        let o_status = [];
        if(order_status)
            o_status = _.split(order_status,'-');

        let aggs = [];
        let agg_match = {};
        agg_match['$match'] =  {};
        if(order_date){
            let dt = new Date(parseInt(order_date));
            dt.setUTCHours(0,0,0,0);
            let dtvalue = dt.getTime();
            let dayStart = new Date(dtvalue);
            let dayEnd = new Date(dtvalue);
            dayEnd.setUTCHours(23,59,59,0);
            agg_match['$match']['func_date'] = {};
            agg_match['$match']['func_date']['$lt'] = dayEnd;
            agg_match['$match']['func_date']['$gte'] = dayStart;
        }else if(cust_name){
            agg_match['$match']['cust_name'] =  { "$regex": cust_name, "$options": "i" };
           
        }else{
            agg_match['$match']['order_status'] = { "$in": o_status };
        }
        aggs.push(agg_match);

        agg_sort_date = {
            $sort:{
                func_date:1
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
