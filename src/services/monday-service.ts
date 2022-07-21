import initMondayClient from 'monday-sdk-js'
import * as Types from '../constants/Types.d'

/**
 * checking if the user that clicked the button can add to the "Currently Tracking" column
 * @returns {boolean | undefined} boolean or undefined
 * undefined in case that any of the chosen column values are empty
 */

export async function checkIfUserCanAssign(boardId: number, itemId: number, userId: number, userTeamId: number | undefined, token: string | undefined): Promise<boolean | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('boardId, itemId, userId', boardId, itemId, userId)

    // need to change the id to the real ids of manager reviewer and team
    const queryPersonsCol: string = `query
    {
      boards(ids: ${boardId}) {
        items(ids: ${itemId}) {
          column_values(ids: ["people", "people2", "people3"]){ 
            value
          }
        }
      }
    }`

    const res: Types.MondayResponse = await mondayClient.api(queryPersonsCol)
    console.log('file: monday-service.ts -> line 23 -> checkIfUserCanAssign -> res', res)
    const colVal: { value: string }[] = res.data.boards[0].items[0].column_values
    console.log('file: monday-service.ts -> line 35 -> checkIfUserCanAssign -> userTeam', userTeamId)
    console.log('file: monday-service.ts -> line 30 -> checkIfUserCanAssign -> value', colVal)

    if (colVal.some((col: any) => !JSON.parse(col.value))) return undefined

    const isUserCanAssign: boolean = colVal.some((col: { value: string }) => {
      const value: Types.QueryValue = JSON.parse(col.value)
      if (value.personsAndTeams[0].kind === 'team') {
        return value.personsAndTeams[0].id === userTeamId
      } else {
        return value.personsAndTeams[0].id === userId
      }
    })

    return isUserCanAssign
  } catch (err) {
    console.log(err)
  }
}

/**
 * In case that the user can assign, check if he is already assigned and exists on "Currently Tracking."
 */
export async function checkAndAssignUser(boardId: number, itemId: number, userId: number, token: string | undefined): Promise<Types.QueryValue | null | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)

    const queryPersonCol: string = `query
      {
        boards(ids: ${boardId}) {
          items(ids: ${itemId}) {
            column_values(ids: "person") {
              value
            }
          }
        }
      }
      `
    const queryRes: Types.MondayResponse = await mondayClient.api(queryPersonCol)
    console.log('file: monday-service.ts -> line 66 -> checkAndAssignUser -> queryRes', queryRes)
    const queryValue: null | Types.QueryValue = JSON.parse(queryRes.data.boards[0].items[0].column_values[0].value)
    console.log('file: monday-service.ts -> line 64 -> checkAndAssignUser -> queryValue', queryValue)

    const mutationValue: string = queryValue ? JSON.stringify({ personsAndTeams: [] }) : JSON.stringify({ personsAndTeams: [{ id: userId, kind: 'person' }] })
    console.log('mutationValue', JSON.stringify(mutationValue))
    const mutatePersonCol: string = `
      mutation {
        change_column_value (board_id: ${boardId}, item_id: ${itemId}, column_id: "person", value: ${JSON.stringify(mutationValue)}) {
            id
        }
    }`

    const mutationRes: Types.MondayResponse = await mondayClient.api(mutatePersonCol)
    console.log('file: monday-service.ts -> line 79 -> checkAndAssignUser -> mutationRes', mutationRes)

    return queryValue
  } catch (err) {
    console.log(err)
  }
}

export async function getDesignatedBoardId(userTeamName: string | undefined, token: string | undefined): Promise<number | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)

    const queryBoards: string = `
    query {
      boards(limit: 2000) {
        name
        id
      }
    }
    `
    const queryRes: Types.MondayResponse = await mondayClient.api(queryBoards)
    console.log('file: monday-service.ts -> line 87 -> getDesignatedBoardId -> userTeamName', userTeamName)
    console.log('file: monday-service.ts -> line 99 -> getDesignatedBoardId -> queryRes', queryRes.data.boards)
    const designatedBoardId: number | undefined = queryRes.data.boards.find((board) => board.name === userTeamName)?.id
    console.log('file: monday-service.ts -> line 101 -> getDesignatedBoardId -> isBoardExists', designatedBoardId)
    if (designatedBoardId) {
      return designatedBoardId
    } else {
      const mutationAddBoard: string = `
      mutation {
        create_board (board_name: ${JSON.stringify(userTeamName)}, board_kind: public, template_id: 2969293191) {
            id
        }
    }
    `
      const mutationRes: Types.MondayResponse = await mondayClient.api(mutationAddBoard)
      console.log('file: monday-service.ts -> line 110 -> getDesignatedBoardId -> mutationRes', mutationRes)
      console.log('mutationRes.data.create_board.id', mutationRes.data.create_board.id)

      return mutationRes.data.create_board.id
    }
  } catch (err) {
    console.log(err)
  }
}

export async function getDesignatedItemName(boardId: number, itemId: number, userId: number, token: string | undefined): Promise<Types.DesignatedItem | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('file: monday-service.ts -> line 4 -> getItemDetails -> boardId, itemId, userId, token', boardId, itemId, userId, token)
    const query: string = `{	
      users(ids: ${userId}) {
        name 
      }
      boards(ids: ${boardId}) {
        items(ids: ${itemId}) {
          name
        }
      }
    }`
    console.log('file: monday-service.ts -> line 12 -> getItemDetails -> query', query)

    const response: Types.MondayResponse = await mondayClient.api(query)
    console.log('file: monday-service.ts -> line 21 -> getDesignatedItemName -> response', response)
    const username: string = response?.data?.users[0].name
    const itemName: string = response?.data?.boards[0].items[0].name
    console.log('file: monday-service.ts -> line 24 -> getDesignatedItemName -> itemName', itemName)
    const designatedItemName: Types.DesignatedItem = {
      username,
      itemName,
    }

    return designatedItemName
  } catch (err) {
    console.log(err)
  }
}

export async function getDesignatedItem(designatedItemName: string, designatedBoardId: number, token: string | undefined): Promise<Types.Item | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('designatedBoardId', designatedBoardId)
    const query: string = ` { 
    boards(ids:${designatedBoardId}) {
      groups(ids: "new_group") {
         items {
            name
             id
          }
        }
      }
    }`

    console.log('getOpenItem -> query', query)
    const response = await mondayClient.api(query)
    console.log('getOpenItem -> response', response)
    const items: Types.Item[] | Array<any> = response.data.boards[0].groups[0].items
    console.log('getOpenItem -> items', items)
    const item: Types.Item = items.find((item) => item.name === designatedItemName)
    console.log('getOpenItem -> item', item)
    return item
  } catch (err) {
    console.log('getOpenItem -> err', err)
  }
}

export async function addNewItem(designatedBoardId: number, designatedItemName: string, userId: number, token: string | undefined): Promise<void> {
  console.log('file: monday-service.ts -> line 219 -> addNewItem -> designatedBoardId', designatedBoardId)
  console.log('addNewItem -> designatedItemName', designatedItemName)
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    const [date, time]: string[] = new Date().toISOString().replace('Z', '').split('T')
    const columnValues: string = JSON.stringify({
      dup__of_is_open: { label: 'Tracking' },
      date_1: { date, time },
      person: { personsAndTeams: [{ id: userId, kind: 'person' }] },
    })
    const query: string = `mutation {
      create_item(board_id: ${designatedBoardId}, group_id:"new_group", item_name: ${JSON.stringify(designatedItemName)}, column_values:${JSON.stringify(columnValues)}) {
        id
        column_values{
          id
          type
          value
        }
      }
    }`
    console.log('addNewItem ->> query', query)

    const response: Types.MondayResponse = await mondayClient.api(query)
    console.log('file: monday-service.ts -> line 115 -> addNewItem -> response', response)
    console.log('file: monday-service.ts -> line 68 -> addNewItem -> response', response?.data)
    console.log('file: monday-service.ts -> line 68 -> addNewItem -> response', response?.data?.create_item?.column_values)
  } catch (err) {
    console.log(err)
  }
}

export async function endTracking(designatedBoardId: number | undefined, designatedItemId: string, token: string | undefined): Promise<void> {
  const mondayClient = initMondayClient()
  await mondayClient.setToken(token)
  const [date, time] = new Date().toISOString().replace('Z', '').split('T')

  const columns: string = JSON.stringify({
    date_2: { date, time: time.split('.')[0] },
    dup__of_is_open: { label: 'Done' },
  })
  const changeColMutation: string = `
    mutation{
      change_multiple_column_values(item_id:${designatedItemId},board_id:${designatedBoardId}, column_values:${JSON.stringify(columns)} ){
        id
      }
    }
  `
  console.log('endTracking -> changeColMutation', changeColMutation)
  const response: Types.MondayResponse = await mondayClient.api(changeColMutation)
  console.log('endTracking -> response', response)
  const groupMutation: string = `mutation{
  move_item_to_group(item_id:${designatedItemId}, group_id:"group_title"){
    id
  }
}`
  const groupResponse: Types.MondayResponse = await mondayClient.api(groupMutation)
  console.log('endTracking -> groupResponse', groupResponse)
}

export async function notify(userId: number, itemId: number, token: string | undefined, message: string): Promise<void> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)

    // const message = `Attention: there is already active item called ${designatedItemName}.`
    const notifyMutation: string = `mutation{
      create_notification (user_id:${userId}, target_id:${itemId}, text:${JSON.stringify(message)}, target_type: Project){
      text
      }
    }`
    const response: Types.MondayResponse = await mondayClient.api(notifyMutation)
    console.log('file: monday-service.ts -> line 264 -> notify -> respons', response)
  } catch (err) {
    console.log(err)
  }
}

export async function getUserTeamDetails(userId: number, token: string | undefined): Promise<Types.UserTeamDetails | undefined> {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    const queryUserTeam: string = `
    query {
      users(ids: ${userId}) {
        teams {
          id
          name
        }
      }
    }
    `
    const res: Types.MondayResponse = await mondayClient.api(queryUserTeam)
    const userTeamId: number = res.data.users[0].teams[0].id
    const userTeamName: string = res.data.users[0].teams[0].name

    return {
      id: userTeamId,
      name: userTeamName,
    }
  } catch (err) {
    console.log(err)
  }
}
