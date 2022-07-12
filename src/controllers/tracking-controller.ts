import * as Types from "../constants/Types"
import { Tracking } from "../models/model"

export async function getTrackings(req, res) {
  try {
    const trackings: Types.ITracking[] = await Tracking.find({})
    res.send(trackings)
  } catch (err) {
    console.log("getTrackings -> err", err)
  }
}

export async function createTracking(req, res) {
  try {
    const tracking: Types.ITracking = req.body.tracking
    const newTracking = new Tracking(tracking)
    await newTracking.save()
    res.send(newTracking)
  } catch (err) {
    console.log("createTracking -> err", err)
  }
}

export async function deleteTracking(req, res) {
  try {
    const { id } = req.params
    const deleted = await Tracking.findByIdAndDelete(id)
    console.log("deleteTracking -> deleted", deleted)
    if (deleted) res.status(200).send({})
  } catch (err) {
    console.log("deleteTracking -> err", err)
  }
}

export async function updateTracking(req, res) {
  const tracking: Types.ITracking = req.body.tracking
  try {
    const existingTracking: Types.CreateItem = await Tracking.findOneAndUpdate({ "calendarBoard.boardId": tracking.calendarBoard.boardId }, tracking, { new: true })
    if (existingTracking) {
      res.send(tracking)
    } else {
      res.status(404).send({ error: "no tracking" })
    }
  } catch (err) {
    console.log("UpdateTracking -> err", err)
  }
}
