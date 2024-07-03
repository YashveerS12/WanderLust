const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} =require("../schema.js");
const Listing=require("../models/listing");
const {isLoggedIn, isOwner}=require("../middleware.js");

const ListingController=require("../controllers/listing.js");

const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
   if(error)
   {
    let errMsg= error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
   }
   else{
    next();
   }
};


//Index Route
router.get("/", wrapAsync(ListingController.index));

//New Routee
router.get("/new",isLoggedIn,ListingController.renderNewForm);

//Show Route for Listings
router.get("/:id", wrapAsync(ListingController.showListing));

//Create Routee
router.post("/" ,isLoggedIn , upload.single("listing[image]"),validateListing ,wrapAsync(ListingController.createListing));

//Edit Routee
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(ListingController.renderEditForm));
//Update Route
router.put("/:id",isLoggedIn,isOwner, upload.single("listing[image]"),validateListing, wrapAsync(async(req,res) => {
    let {id}=req.params;
    let listing =await Listing.findByIdAndUpdate(id,{...req.body.listing});//this is a js object used to store multiple values.
    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);//this is used for redirecting to the show page of particular id.
}));
//Delete Request
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async(req,res)=>{
   let{id}=req.params;
   let deletedListing=await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Listing Deleted!");
   res.redirect("/listings");

}));

module.exports=router;