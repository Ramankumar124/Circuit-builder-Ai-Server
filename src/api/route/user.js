import {login} from "../service/authentication/login.js"
import {register} from "../service/authentication/signup.js"
import { updateProfile } from "../service/authentication/updateProfile.js"
import { changePassword } from "../service/authentication/updateProfile.js"
import { Router } from "express"

import {protectRoute} from "../middleware/protectRoute.js"

export const authRoute = Router();

authRoute.post("/signup", register)
authRoute.post("/login", login)
authRoute.put('/profile', protectRoute, updateProfile);
authRoute.patch('/password',protectRoute, changePassword)