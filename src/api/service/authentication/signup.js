import User from "../../model/user.js"
import { handleError } from "../../../util/handleError.js";
import jwt from "jsonwebtoken";
import {properties} from "../../../config/properties.js"

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Check if email already exists
    const existingOwner = await User.findOne({email});
    if (existingOwner) {
      return res
        .status(400)
        .send({ message: "Email already in use.", error: "exist email" });
    }

    // Create new owner
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    const payload = {
      id: user?._id,
      firstName,
      lastName,
      email,
    };

    const JWT_SECRET_KEY = properties?.JWT_SECERT_KEY;
    console.log(JWT_SECRET_KEY)

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    res.status(200).send({
      message: "User registered successfully.",
      token,
    });
  } catch (error) {
    handleError(error, res);
  }
};
