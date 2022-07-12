import mongoose from "mongoose"
require("dotenv").config()

const connection = mongoose.createConnection(process.env.MONGODB_CLUSTER!)

const TrackingSchema = new mongoose.Schema({
  trackedBoards: [{ boardId: Number, connectId: Number }],
  calendarBoard: {
    boardId: Number,
    doneGroupId: String,
    trackedGroupId: String,
    connectColId: Number,
    peopleColId: Number,
    startDateColId: Number,
    endDateColId: Number,
  },
})

export const Tracking = connection.model("trackings", TrackingSchema)
