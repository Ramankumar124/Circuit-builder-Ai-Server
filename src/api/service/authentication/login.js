import User from "../../model/user.js";
import { properties } from "../../../config/properties.js";
import { handleError } from "../../../util/handleError.js";
import jwt from "jsonwebtoken"
const JWT_SECRET = properties?.JWT_SECERT_KEY;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required." });
    }

    // Find the owner by email
    const user = await User.findOne({ email });

    if(!user) return res.status(404).send({message: "User not exist"});

    // Verify password
    const isMatch = user?.comparePassword(password)
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid password." });
    }

    const payload = {
        id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email
    }

    // Generate a JWT token
    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).send({
      message: "Login successful.",
      token,
    });
  } catch (error) {
    handleError(error, res);
  }
};