const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/airbnb";
main().then(()=>{
    console.log("Connected to db");
}).catch(err=>{
    console.log(err);
})
async function main(){
await mongoose.connect(MONGO_URL);
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    initdata.data= initdata.data.map((obj)=>({...obj,owner:"665d8274e2ab65c5f1e873ab"}));
    await Listing.insertMany(initdata.data);
    console.log("Data is entered");
}
initDB();