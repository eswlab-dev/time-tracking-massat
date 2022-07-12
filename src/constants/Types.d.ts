export interface DesignatedItem {
  username: string
  itemName: string
}

export interface Item {
  name: string
  id: string
}

export interface Response {
  data: Data
  account_id: number
}

export interface Data {
  users: Array<any>
  boards: Array<any>
  Items: Array<any>
  create_item: CreateItem
}

export interface CreateItem {
  id: string
  column_values: Array<object>
}

export interface Value {
  linkedPulseIds: Array<any>
}
export interface ITracking {
  trackedBoards: { boardId: number; connectColId: number }[]
  calendarBoard: {
    boardId: number
    doneGroupId: string
    trackedGroupId: string
    connectColId: number
    peopleColId: number
    startDateColId: number
    endDateColId: number
  }
  _id?: string
}
