import mongoose from "mongoose"

export const circuitSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project Id is required"]
    },
    prompt: {
        type: String,
        required: [true, "Prompt is required"]
    },
    circuit: {
        type: Object,
    },
}, {timestamps: true})

export default mongoose.model("Circuit", circuitSchema)