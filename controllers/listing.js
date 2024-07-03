const { response } = require("express");
const Listing=require("../models/listing");
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});


module.exports.index=async (req,res)=>{

    var search= "";
    if(req.query.search)
    {
        search=req.query.search;
    }

    const allListings=await Listing.find({
        $or:[
            {title:{$regex:'.*'+search+'.*',$options:'i'}},
            {location:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
    });
    res.render("listings/index.ejs",{ allListings })
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing=async (req,res)=>{


    let {id}=req.params;
    const listing =await Listing.findById(id).populate({path: "reviews",populate:{path:"author"}}).populate("owner");
    if(!listing)
    {
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{ listing });

};

module.exports.createListing=async (req,res,next)=>{
    //let {title,description,image,price,country,location}=req.body;
    // let result=listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error)
    // {
    //     throw new ExpressError(400,result.err);
    // }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send()

    let url=req.file.path;
    let filename=req.file.filename;

    const newlisting=new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};

    newlisting.geometry=response.body.features[0].geometry;
    let savedListing= await newlisting.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing)
    {
        req.flash("error","Listing you requested fo does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{ listing, originalImageUrl });
};

module.exports.updateListings=async(req,res)=>{
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
};

module.exports.deleteListing=async (req,res)=>{
    let {id}=req.params;
    let deletedlisting =await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};