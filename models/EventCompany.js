import mongoose from "mongoose";

const EventCompanySchema = new mongoose.Schema(
  {
    eventCompanyName: { type: String },
    eventCompanyPocName: { type: String },
    eventCompanyPocEmail: { type: String },
    eventCompanyPocPhone: { type: String },
    eventCompanyAddress: { type: String },
    eventCompanySponserAmount: { type: String },
    eventCompanyProblemStatement: { type: String },
    eventCompanyPreferredCollege: { type: String },
    eventCompanyMessage: { type: String },
    eventCompanyRole: { type: String },
    eventCompanyPlanType: { type: String },

  },
  { timestamps: true }
);

export default mongoose.model("TrekathonCompany", EventCompanySchema);
