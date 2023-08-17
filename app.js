//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://cluster0.aw45wr3.mongodb.net/todolistDB',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: "ezeanijoy",
  pass: "ezeanimongo3737dbjoy"
}).then(function(){
  console.log("Connection successful")
}).catch(function(err){
  console.log(err);
})

const { Schema } = mongoose;
const itemsSchema = new Schema(
    {
        name: {
             type: String,
        required: [true, 'Why no name?']
        }
    }
)
const Item = mongoose.model('Item', itemsSchema);


const  item1 = new Item({
  name: "Welcome to your todolist😊"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
 });

const item3 = new Item({
  name: "👈 Hit this to delete an item"
});

const addedItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);
const day = date.getDate();
app.get("/", function(req, res) {
  if (Item === 0){
    async function addItem(){
      // this condition is carried out to avoid our insertmany to keep inserting the addeditems
     await Item.insertMany(addedItems).then(function () {
      //console.log("Successfully saved addedItems to DB");
    }).catch(function (err) {
  console.log(err);
    });
    res.redirect("/");
    }
    addItem();
   
  } else{
    async function myItems() {
        //to find your items
      const items= await Item.find({}); 
      res.render("list.ejs", {listTitle: day, newListItems: items});
    }
    myItems();
  }
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  async function checkedItem(err) {
    //to find your items in the lists document
  const items = await List.findOne({name: customListName});
    if(!err){
      if(!items){
       //create a new list when inputed params is not in the lists collection
       const list = new List({
        name: customListName,
        items: addedItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show an existing list
        res.render("list.ejs",  {listTitle: items.name, newListItems: items.items })
      }
    }
}

  checkedItem();
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const  item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  }else{
    async function checked() {
      //to find your items in the document
    const checkedItem= await List.findOne({name: listName});
     checkedItem.items.push(item);
     checkedItem.save();
  }
  checked();
  res.redirect("/" + listName);
  }

  
  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkedItem;
  const hiddenListName = req.body.hiddenList;
   if ( hiddenListName === day){
    async function deletedItem(){
      await Item.findByIdAndRemove(checkedItemId).then(function(){
             res.redirect("/");
        }).catch(function(err){
            console.log(err);
        });
     }
    deletedItem();
   }else{
    async function otherPagesItemsDelete(){
      const foundOne = await List.findOneAndUpdate({name: hiddenListName}, {$pull: {items: {_id: checkedItemId}}});
      if(foundOne){
        res.redirect("/" + hiddenListName);
      }
     }
     otherPagesItemsDelete();
   }

    
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
