import { Context } from "grammy";
import mongoose from "mongoose";
import AnalyticsSchema from "./schema";

// Model the schema
const Analytics = mongoose.model("bot-analytics", AnalyticsSchema);

const saveAnalytics = (userData: any) => {
  // Create an instance of model User
  const analytics = new Analytics(userData);

  // Save the new model instance, passing a callback
  analytics.save().then((item) => console.log(item));
};

const saveAnalyticsEvent = (ctx: Context, event: string) => {
  const userData = ctx.from;
  // saveAnalytics({ ...userData, event });
};

export { saveAnalytics, saveAnalyticsEvent };
