import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Create a Schema for Users
const AnalyticsSchema = new Schema({
  id: Number,
  is_bot: Boolean,
  first_name: String,
  last_name: String,
  username: String,
  language_code: String,
  event: String,
});

export default AnalyticsSchema;
