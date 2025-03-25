import mongoose from "mongoose"

export const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, "Project Name is required"],
        minlength: [3, "Project Name must be atleast 3 character"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User id is required"]
    }
}, {timestamps: true})

projectSchema.virtual("circuits", {
    ref: "Circuit",
    localField: "_id",
    foreignField: "projectId",
  });
  
  projectSchema.set("toObject", { virtuals: true });
  projectSchema.set("toJSON", { virtuals: true });
  

export default mongoose.model("Project", projectSchema)