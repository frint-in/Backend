import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    teamId: { type: String, unique: true },
    teamName: { type: String },
    teamLeadEmail: { type: String },
    Members: [
      {
        userEmail: { type: String },
        status: { type: String },
      },
    ],
    problemStatement: { type: String },
    githubRepo: { type: String },
    youtubeLink: { type: String },
  },
  { timestamps: true }
);


export default mongoose.model("Event", EventSchema);
