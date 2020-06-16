//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// mongoose connection
//mongodb+srv://silvia:Filhos_2019@cluster0-alith.mongodb.net/todolistDB?retryWrites=true&w=majority
//"mongodb://localhost:27017/todolistDB"
mongoose.connect("mongodb+srv://silvia:Filhos_2019@cluster0-alith.mongodb.net/todolistDB?retryWrites=true&w=majority", {
useUnifiedTopology: true,
useNewUrlParser: true
});
//create a schema = collection
const itemsSchema = new mongoose.Schema({
    name: String
});
//create a model
const Item = mongoose.model("Item",itemsSchema);
//create mongoose document
const item1 = new Item({
  name: "Welcome to your todolist"
});
const item2 = new Item({
  name: "Hit + button to add a new item"
});
const item3 = new Item({
  name:"<-- Hit this to delete an item"
});
//create an array to insert elements
const defaultItems = [item1,item2,item3];
//new schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

/***** Get method *****/
app.get("/", function(req, res) {

      Item.find({}, function (err, foundItems){
        if(foundItems.length === 0){
          Item.insertMany(defaultItems, function(err){
            if(err){
              console.log(err);
            } else {
              console.log("Succesfully saved default items to DB.");
            }
          });
        res.redirect("/");
        } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      });
});
/***** Get method using parameters *****/
app.get("/:customListName", function(req,res){
const customListName =_.capitalize(req.params.customListName);

      List.findOne({name: customListName}, function(err, foundList){
        if (!err){
          if (!foundList){
            //create a new list
            const list = new List({
              name:customListName,
              items: defaultItems
            });
            list.save();
      res.redirect("/"+ customListName);
          } else {
            //show an existing list
            res.render("List",{listTitle: foundList.name, newListItems: foundList.items});
}
  }

  });
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
      });

        if (listName === "Today"){
          item.save();
          res.redirect("/");

        } else {
          List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
          });
        }
  });

app.post("/delete", function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err){
      console.log("The id " + checkedItemId +" was Succesfully removed");
  res.redirect("/");
    }
  });
} else {
 List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
   if (!err){
     res.redirect("/" + listName);
   }
 });
  }
});

//App listen port 3000
let port = process.env.PORT;

if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Succesfully !");
});
