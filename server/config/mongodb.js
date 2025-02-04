import mongoose from "mongoose";

const conneectDB = async () => {

    mongoose.connection.on("connected", () => (
        console.log("MongoDB connected")))
    
   
         await mongoose.connect(`${process.env.MONGO_URL}/mern-auth`);

}

export default conneectDB;