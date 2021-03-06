import { Router } from "express"
const router = Router()

import * as mondayController from "../controllers/monday-controller"
import authenticationMiddleware from "../middlewares/authentication"

router.post("/monday/track", authenticationMiddleware, mondayController.trackEmployee)

export default router
