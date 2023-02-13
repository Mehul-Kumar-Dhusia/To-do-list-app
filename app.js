const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine" , "ejs")
app.use(express.static("public"))

mongoose.set('strictQuery', true)
mongoose.connect("mongodb+srv://Mehul-Kumar-Dhusia:Test123@cluster0.iatihjz.mongodb.net/todolistDB")

let today = new Date() ;
let options = {
    weekday : "long",
    month : "long",
    day : "numeric"
}
let day = today.toLocaleDateString("en-US" , options)

const itemSchema = {
    name : String
}
const Item = mongoose.model("Item" , itemSchema)

const listSchema = {
    name : String,
    item : [itemSchema]
}

const List = mongoose.model("List" , listSchema)

// const item1 = new Item({
//     name : "Eat"
// })
// const item2 = new Item({
//     name : "Sleep"
// })
// const item3 = new Item({
//     name : "Code"
// })
// const tempArray = [item1 , item2 , item3]



app.get("/" , function(req , res){
    Item.find({} , function(err , data){
        res.render("index" , {kindofday : day , item : data})
        // if(data.length === 0){
        //     Item.insertMany(tempArray , function(err){
        //         if(err){
        //             console.log(err)
        //         }
        //     })
        //     res.redirect("/")
        // }
        // else{
        //     res.render("index" , {kindofday : day , item : data})
        // }
    })
})


app.get("/:customList" , function(req ,res){
    const customList = _.capitalize(req.params.customList)
    List.findOne({name : customList} , function(err ,data){
        if(!err){
            if(!data){
                const list = new List({
                    name : customList,
                    item : []
                })
                list.save()
                res.redirect("/" + customList)
            }
            else{
                res.render("index" , {kindofday : customList , item : data.item})
            }
        }
    }) 
})

app.post("/" , function(req , res){
    const box = req.body.box 
    const itemName = req.body.itemName
    const newItem = new Item({
        name : itemName
    })
    if(box == day){
        newItem.save()
        res.redirect("/")
    }
    else{
        List.findOne({name : box} , function(err , data){
            if(!err){
                data.item.push(newItem)
                data.save()
                res.redirect("/" + box)
            }
        })
    }    
})


app.post("/delete" , function(req , res){
    const id = req.body.checkbox
    const itemName = req.body.itemName
    if(itemName === day){
        Item.findByIdAndRemove(id, function(err){
            if(!err){
                console.log("successfully deleted")
            }
        })
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name : itemName} , {$pull : {item : {_id : id}}} , function(err ,data){
            if(!err){
                console.log("successfully deleted")
                res.redirect("/" + itemName)
            }
        })
    }   
})


app.listen(3000 , function(){
    console.log("Server is runing at port 3000");
})