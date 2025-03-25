import User from "../../model/user.js"
import { handleError } from "../../../util/handleError.js";

export const updateProfile = async(req, res) => {
    try {
        const {firstName, lastName, email} = req.body;
        const {id} = req.user

        if(!(firstName || lastName || email)) return res.status(400).send({message: "Missing required filed"})

        const user = await User.findByIdAndUpdate(id, {firstName, lastName, email}, {new: true});
        if(!user) {
            return res.status(404).send({message: "User not exist"})
        }
        delete user.password
        return res.status(200).send({message: "Update successfully", data: user})
    } catch (error) {
        handleError(error, res);
    }
}

export const changePassword = async(req, res) => {
    try {
        const {old_password, new_password} = req.body;
        const {id} = req.user;

        const user = User.findById(id)
        if(!user) return res.status(400).send({message: "User not exist"});

        const isMatch = user?.comparePassword(old_password)
        if(!isMatch) return res.status(400).send({message: "Wrong password"});

        await User.findOneAndUpdate({_id: id}, {password: new_password}, {new: true});
    } catch (error) {
        handleError(error, res)
    }
}