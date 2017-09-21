var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
    {
        name : "cloud Rest",
        image : "https://i.ytimg.com/vi/N5qLVlSzaQ0/maxresdefault.jpg",
        description: "hahaha"
    },
    {
        name : "Desert Mesa",
        image : "https://i.ytimg.com/vi/N5qLVlSzaQ0/maxresdefault.jpg",
        description: "hahaha"
    },
    {
        name : "cloud Rest",
        image : "https://i.ytimg.com/vi/N5qLVlSzaQ0/maxresdefault.jpg",
        description: "hahaha"
    }
    ];

function seedDB(){
    Campground.remove({}, function(err) {
        if(err) {
            console.log(err);
        }
        console.log("remove Campgrounds");
        data.forEach(function(seed){
    
            Campground.create(seed, function(err, campground){
                if(err) {
                    console.log(err);
                }else {
                    console.log("add a campground");
                    // create a comment
                    
                    Comment.create(
                        {
                            text: " This is a great place",
                            author: "Jeff"
                        }, function (err, comment) {
                            if(err) {
                                console.log(err);
                            }else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log("create the new comment !!!")
                            }
                        })
                }
            });
        });
        
    });
    
    //add a few campgrounds
    // data.forEach(function(seed){
        
    //     Campground.create(seed, function(err, data){
    //         if(err) {
    //             console.log(err);
    //         }else {
    //             console.log("add a campground");
    //         }
    //     })
    //     });
}

module.exports = seedDB;