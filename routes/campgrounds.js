var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var multer = require("multer");
var config = require("../../config");
var storage = multer.diskStorage({
    filename: function(request, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

// Image type validation
var imageFilter = function(request, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    callback(null, true);
};

// MULTER config
var upload = multer({ storage: storage, fileFilter: imageFilter });

// CLOUDINARY config
var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret
});

// INDEX - display all grounds
router.get("/", function(request, response) {
    var perPage = 4;
    var pageQuery = parseInt(request.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (request.query.search) {
        const regex = new RegExp(escapeRegex(request.query.search), "gi");
        Campground.find({ name: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allGrounds) {
            Campground.countDocuments({ name: regex }).exec(function(err, count) {
                if (err) {
                    console.log(err);
                    response.redirect("back");
                }
                else {
                    var noMatch = false;
                    if (allGrounds.length == 0) {
                        noMatch = true;
                    }
                    response.render("campgrounds/index", {
                        campgrounds: allGrounds,
                        current: pageNumber,
                        noMatch: noMatch,
                        pages: Math.ceil(count / perPage),
                        search: request.query.search,
                        page: 'campgrounds'
                    });
                }
            });
        });
    }
    else {
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allGrounds) {
            Campground.countDocuments().exec(function(err, count) {
                if (err) {
                    console.log(err);
                }
                else {
                    response.render("campgrounds/index", {
                        campgrounds: allGrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: false,
                        page: 'campgrounds',
                        search: false
                    });
                }
            });
        });
    }
});

// NEW - show the form to create a new ground
router.get("/new", middleware.isLoggedIn, function(request, response) {
    response.render("campgrounds/new");
    console.log(config.cloudinary_cloud_name);
    console.log(config.cloudinary_api_key);
    console.log(config.cloudinary_api_secret);
});

// CREATE - add new ground to dataBase
router.post("/", middleware.isLoggedIn, upload.single("image"), function(request, response) {
    cloudinary.uploader.upload(request.file.path, function(result) {
        // add cloudinary image url to the campground object
        request.body.campground.image = result.secure_url;
        // add author to the campground object
        request.body.campground.author = {
            id: request.user._id,
            username: request.user.username
        }
        // add new campground object to database
        Campground.create(request.body.campground, function(err, newlyCreated) {
            if (err) {
                request.flash("error", "Something went wrong. Please try again");
                console.log(err);
                return response.redirect("back");
            }
            response.redirect("/campgrounds/" + newlyCreated.id);
        });
    });
});


// SHOW - display single campground inner page
router.get("/:id", function(request, response) {
    Campground.findById(request.params.id).populate("comments").exec(function(err, foundGround) {
        if (err || !foundGround) {
            request.flash("error", "Campground not found");
            response.redirect("back");
        }
        else {
            response.render("campgrounds/show", { campground: foundGround });
        }
    });
});

// EDIT - edit existing campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(request, response) {
    Campground.findById(request.params.id, function(err, foundGround) {
        response.render("campgrounds/edit", { campground: foundGround });

    });
});

// UPDATE - save edited compground to database
router.put("/:id", middleware.checkCampgroundOwnership, function(request, response) {
    Campground.findByIdAndUpdate(request.params.id, request.body.campground, function(err, updatedGround) {
        response.redirect("/campgrounds/" + request.params.id);
    });
});

// DESTROY - delete existing compground from database
router.delete("/:id", middleware.checkCampgroundOwnership, function(request, response) {
    Campground.findByIdAndRemove(request.params.id, function(err) {
        response.redirect("/campgrounds");
    });
});

// safeguard against regex DDoS attack
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
