var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(request, response, next) {
    if (request.isAuthenticated()) {
        Campground.findById(request.params.id, function(err, foundGround) {
            if (err || !foundGround) {
                request.flash("error", "Campground was not found");
                response.redirect("back");
            }
            else {
                if (foundGround.author.id.equals || request.user.isAdmin) {
                    next();
                }
                else {
                    request.flash("error", "You must be logged as author");
                    response.redirect("back");
                }
            }
        });
    }
    else {
        request.flash("error", "You need to be logged in order to proceed");
        response.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(request, response, next) {
    if (request.isAuthenticated()) {
        Comment.findById(request.params.comment_id, function(err, foundComment) {
            if (err || !foundComment) {
                request.flash("error", "Comment was not found");
                response.redirect("back");
            }
            else {
                if (foundComment.author.id.equals(request.user._id) || request.user.isAdmin) {
                    next();
                }
                else {
                    request.flash("error", "You must be logged as author");
                    response.redirect("back");
                }
            }
        });
    }
    else {
        request.flash("error", "You need to be logged in order to proceed");
        response.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(request, response, next) {
    if (request.isAuthenticated()) {
        console.log("isAuthenticated");
        return next();
    }
    request.flash("error", "You need to be logged in to proceed");
    response.redirect("/login");
}

module.exports = middlewareObj;
