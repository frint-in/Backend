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
    preferredProblemStatement: { type: [String] },
    problemStatement: { type: String },
    summary: { type: String },
    githubRepo: { type: String },
    youtubeLink: { type: String },
    hostedLink: { type: String },
  },
  { timestamps: true }
);


export default mongoose.model("Trekathon", EventSchema);
