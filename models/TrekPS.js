import mongoose from "mongoose";

const TrekPS = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    requirements: {
      type: {
        objectives: [{
          type: String,
          required: true
        }],
        technicalRequirements: [{
          type: String,
          required: true
        }],
        deliverables: [{
          type: String,
          required: true
        }]
      },
      required: true
    },
    considerations: [{
      type: String
    }],
    domain: {
      type: String,
      enum: ['AI/ML', 'IoT', 'Web/Mobile', 'Data Science', 'Blockchain', 'Other'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true
    },
    expectedDuration: {
      type: String,
      required: true
    },
    resources: [{
      name: { type: String },
      link: { type: String }
    }],
    tags: [{ 
      type: String 
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active'
    }
  },
  { timestamps: true }
);

export default mongoose.model("TrekPS", TrekPS);