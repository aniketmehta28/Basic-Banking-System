// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var mongodb = require('mongodb')
const mongoose = require('mongoose');


const app = express();
mongoose.connect('mongodb://localhost:27017/entrydB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));




// Home Route
app.get("/", function(req, res) {
  res.render('home');
});

const entrySchema = new mongoose.Schema ({
  name : String,
  account : Number,
  balance : Number,
  email : String,
  age : Number,
  address : String
});
const Customer = new mongoose.model("Customer", entrySchema);

const transferSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  amount: Number
});

const Transfer = new mongoose.model("Transfer", transferSchema);


app.get("/list", function(req, res) {

  Customer.find({},function(err,data){
      res.render('list',{
        entries:data
      });
});

});


app.get("/transfer", function(req, res) {
  Customer.find({},function(err, customers) {
    res.render('transfer', {
      entries: customers
    });
  });
});
app.post("/amount", async(req, res) =>{
  const sName = req.body.senderName;
    const rName =req.body.receiverName;
  const transferA = req.body.amount;
  const firstAccount = await Customer.findOne({name:sName});
  const firstB = firstAccount.balance;
  const secondAccount = await Customer.findOne({name:rName });
  const secondB = secondAccount.balance;

  if(firstB < transferA){
    res.redirect("/transfer");
  } else if(transferA< 0){
      res.redirect("/transfer");
  }

  const transfer = new Transfer({
  sender: sName,
  receiver:rName,
  amount: transferA
});
  transfer.save()
  res.redirect("/transactions")

  const newB = firstB - transferA;
  const newBR = parseInt(secondB) + parseInt(transferA) ;
  await Customer.findOneAndUpdate({name: sName},{balance: newB});
  await Customer.findOneAndUpdate({name: rName},{balance: newBR});


});
app.get("/transactions", function(req, res) {
   Transfer.find({},function(err,transactions){
     res.render('transactions', {
       transfers: transactions
     });
   });
});

app.get("/:profileName", function(req, res) {
  const profileName = req.params.profileName;
  Customer.find({
    name: profileName
  },function(err, customers) {
    res.render('profile', {
      entries: customers
    });
  });
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
})
