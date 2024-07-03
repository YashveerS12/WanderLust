const express = require("express");
const router = express.Router({mergeParams:true});
const wrapasync =require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review =require("../models/review.js");
const Listing =require("../models/listing.js");
const {validatereview,isLoggedIn, isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");



//Review Post route
router.post("/",isLoggedIn, validatereview, wrapasync(reviewController.createReview));
//Review Delete route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapasync(reviewController.destroyReview));

module.exports=router;