import mongoose from "mongoose"

export const shareSchema = new mongoose.Schema({
    isShare: {
        type: Boolean,
        required: true
    },
    circuitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Circuit",
        required: true
    }
})

//for findById method
shareSchema.pre("findById", async function (next) {
    this.where({isShare: true})
    next();
})
//for findOne method
shareSchema.pre("findOne", async function(next) {
    this.where({isShare: true})
    next()
})

export default mongoose.model("Share", shareSchema)