import mongoose from "mongoose";

export const connectDB = async(mongoUrl) => {
    const db_config_object = { 
        // ssl: true, 
    };
    mongoose
    .connect(mongoUrl, db_config_object)
    .then(() => {
        console.log("Connected to Database!");
    })
    .then((err) => {
        if(err) console.log(err);
    })
}
