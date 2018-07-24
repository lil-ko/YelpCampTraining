var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Black gate",
        image: "https://d1u5p3l4wpay3k.cloudfront.net/wowpedia/thumb/7/70/Black_Gate.jpg/800px-Black_Gate.jpg?version=cd7406e73998aa4953ca09f81b1daa28",
        description: "We have heard rumors that one of the strongest of the eredar could soon enter this world through the Black Gate.If these rumors are to be believed, it could even be Archimonde the Defiler.Should he arrive uncontested, Draenor itself is likely to fall."

    },
    {
        name: "Ahn'Qiraj",
        image: "https://d1u5p3l4wpay3k.cloudfront.net/wowpedia/d/d4/Ahn%27Qiraj_Gates.jpg?version=a2db00d71a9a852545ef25f8608f023b",
        description: "Ahn'Qiraj (pronounced 'AWN-key-rawj') is the city-kingdom of the Qiraji found in the southern part of Silithus. It was originally a titan research station which housed the old god C'Thun before being commandeered by the Aqir, who would become the Qiraji led by the Twin Emperors: Vek'nilash and Vek'lor. Following the War of the Shifting Sands, the kingdom was contained from the rest of the world by the Scarab Wall, until it was opened again recently."

    },
    {
        name: "Naxxramas",
        image: "https://d1u5p3l4wpay3k.cloudfront.net/wowpedia/thumb/9/90/Naxxramas_TCG.jpg/773px-Naxxramas_TCG.jpg?version=aacda982dd81e25339a91df335698420",
        description: "Naxxramas is a giant necropolis floating over Wintergarde Keep, in Dragonblight. It has the questionable honor to serve as the seat of one of the Lich King's most powerful officers, the dreaded lich Kel'Thuzad."

    }
];

function seedDB() {
    //Remove all campgrounds
    Campground.remove({}, function(err) {
        if (err) {
            console.log(err);
        }
        console.log("removed campgrounds");
        //Add a few campgrounds
        data.forEach(function(seed) {
            Campground.create(seed, function(err, campground) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("added a campground");
                    //Add a few comments
                    Comment.create({
                        text: "For the horde!",
                        author: "Lickmybone"
                    }, function(err, comment) {
                        if (err) {
                            console.log(err);
                        }
                        campground.comments.push(comment);
                        campground.save();
                        console.log("Created new comment");
                    });
                }
            });
        });
    });





}

module.exports = seedDB;
