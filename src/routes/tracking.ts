import { Router } from "express"
const router = Router()

import * as trackingController from "../controllers/tracking-controller"

router.get("/", trackingController.getTrackings)
router.post("/", trackingController.createTracking)
router.put("/", trackingController.updateTracking)
router.delete("/:id", trackingController.deleteTracking)

export default router
