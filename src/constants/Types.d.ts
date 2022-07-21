export interface DesignatedItem {
  username: string
  itemName: string
}

export interface Item {
  name: string
  id: string
}

export interface MondayResponse {
  data: Data
  account_id: number
}

export interface Data {
  users: Array<any>
  boards: Array<any>
  Items: Array<any>
  create_item: CreateItem
  create_board: CreateBoard
}

export interface QueryValue {
    changed_at: string
    personsAndTeams: any[]
}

interface CreateBoard {
  id: number
}

export interface CreateItem {
  id: string
  column_values: Array<object>
}

export interface Value {
  linkedPulseIds: Array<any>
}

export interface UserTeamDetails {
  id: number,
  name: string
}
