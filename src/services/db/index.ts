import mongoose from "mongoose";

const connectToDB = (url: string) => {
  mongoose
    .connect(url, { dbName: "persian-poems" })
    .then(() => console.log("Successfully connected to the database"))
    .catch((error: any) => {
      console.log("Could not connect to the database. Exiting now...", error);
      process.exit();
    });
};

export default connectToDB;
