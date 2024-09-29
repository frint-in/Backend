import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phono: {
      type: Number,
      required: true,
    },
    // internships: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Internship",
    //   },
    // ],
    // companies: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Company",
    //   },
    // ],
    // users: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
