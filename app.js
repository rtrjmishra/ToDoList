//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-rtrj:test123@todolist.zyl5f.mongodb.net/todolistDB',{useNewUrlParser: true});

const itemsSchema = {
    name: String
  };
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist"
});
const item2 = new Item({
  name: "Press + to add new item"
});
const item3 = new Item({
  name: "<-- Press to delete item"
});
const item4 = new Item({
  name: "Press any item to open it's custom list"
});

const defaultArray = [item1,item2,item3,item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

var today = new Date();
var options = {
  weekday: "long",
  day: "numeric",
  month:"long"
};
var currentDay = today.toLocaleDateString("en-IN",options);

//APP.GET
app.get("/",function(req,res) {
Item.find({},function(err,results){
    if (results.length === 0){
      Item.insertMany(defaultArray,function(err){
        if(err){console.log(err);}
        else{console.log("SUCCKESS");
      }
      res.redirect("/");
      });

    }else{
      res.render("list",{day: currentDay, items: results});
    }
  });
});

//APP.GET

app.get("/:customListName",function(req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultArray
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
          res.render("list",{day: foundList.name, items: foundList.items});
        }
      }
    });

});

//APP.POST

app.post("/",function(req,res)
{
      var newItem = req.body.new_item;
      var listName = req.body.list;

      const new_Item = new Item({
        name: newItem
      });
      if (listName === currentDay){

      new_Item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName},function(err,foundList)
      {
        if(!err){
        foundList.items.push(new_Item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
    }
});

//DELETE

app.post("/delete",function(req,res)
{
  const checkItemId = req.body.checked_item;
  const listName = req.body.listName;

  if (listName === currentDay){
    Item.findByIdAndRemove(checkItemId,function(err){
      if(!err)
      {
        console.log("Successfully deleted item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}},
      function(err,foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }

});
let port = process.env.PORT;
if(port== null || port==""){port =3000;}

app.listen(port,function() {
  console.log("Server running on 3000");
});
