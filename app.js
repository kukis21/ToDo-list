const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const day = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const today = day.getDay();

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/todolistDB");
app.use(express.static("public"))

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Hi, it's your TODO list!"
});
const item2 = new Item({
    name: "I'll remember everything for you :)"
});
const item3 = new Item({
    name: "I know you'll strikethrough all. Be motivated!!"
});
const defaultItems = [item1, item2, item3];

const listsSchema ={
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listsSchema);

app.get("/", function(req, res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err) {
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully saved default items to DB.");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {day: today, listTitle: "Note", items: foundItems});
        }
    });
});
    
app.post("/", function(req, res){
    const listItem = req.body.newItem;
    const listName = req.body.route;
    
    const item = new Item({
        name: listItem
    });
    if(listName === "Note"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }   
});

app.get("/:customListName", function (req, res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }else{
                res.render("list", {day: today, listTitle: foundList.name, items: foundList.items});
            }
        }
    });
});

app.post("/delete", function(req, res){
    const checkedItemID = req.body.checked;
    const listName = req.body.route;
    if(listName === "Note"){
    Item.findByIdAndRemove(checkedItemID, function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Successfully deleted checked item from DB.");
            res.redirect("/");
        }
    } );
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
});

app.listen(3000, function(){
    console.log("Server is active at port 3000");
})