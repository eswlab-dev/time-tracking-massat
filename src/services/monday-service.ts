import initMondayClient from "monday-sdk-js"

export async function getDesignatedItemName(boardId, itemId, userId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log("mondayClient", mondayClient)
    console.log("file: monday-service.ts -> line 4 -> getItemDetails -> boardId, itemId, userId, token", boardId, itemId, userId, token)

    const query = `{	
      users(ids: ${userId}) {
        name 
      }
      boards(ids: ${boardId}) {
        items(ids: ${itemId}) {
          name
        }
      }
    }`
    console.log("file: monday-service.ts -> line 12 -> getItemDetails -> query", query)

    const response = await mondayClient.api(query)
    const username = response.data.users[0].name
    const itemName = response.data.boards[0].items[0].name

    const designatedItemName = `${username} - ${itemName}`
    return designatedItemName
  } catch (err) {
    console.log(err)
  }
}

export async function getOpenItem(designatedItemName, designatedBoardId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log("designatedBoardId", designatedBoardId)
    const query = ` { 
    boards(ids:2779374834) {
      groups(ids: "new_group") {
         items {
            name
             id
          }
        }
      }
    }`

    console.log("getOpenItem -> query", query)
    const response = await mondayClient.api(query)
    console.log("getOpenItem -> response", response)
    const items = response.data.boards[0].groups[0].items
    console.log("getOpenItem -> items", items)
    const item = items.find((item) => item.name === designatedItemName)
    console.log("getOpenItem -> item", item)
    return item
  } catch (err) {
    console.log("getOpenItem -> err", err)
  }
}

export async function addNewItem(designatedBoardId, designatedItemName, userId, token) {
  console.log("addNewItem -> designatedItemName", designatedItemName)
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    const [date, time] = new Date().toISOString().replace("Z", "").split("T")
    const columnValues = JSON.stringify({
      dup__of_is_open: { label: "Tracking" },
      date_1: { date, time },
      person: { personsAndTeams: [{ id: userId, kind: "person" }] },
    })
    const query = `mutation {
      create_item(board_id: ${designatedBoardId}, group_id:"new_group", item_name: ${JSON.stringify(designatedItemName)}, column_values:${JSON.stringify(columnValues)}) {
        id
        column_values{
          id
          type
          value
        }
      }
    }`
    console.log("addNewItem -> query", query)

    const response = await mondayClient.api(query)
    console.log("file: monday-service.ts -> line 68 -> addNewItem -> response", response.data)
    console.log("file: monday-service.ts -> line 68 -> addNewItem -> response", response.data.create_item.column_values)
  } catch (err) {
    console.log(err)
  }
}
export async function endTracking(designatedItemId, designatedBoardId, token) {
  const mondayClient = initMondayClient()
  await mondayClient.setToken(token)
  const [date, time] = new Date().toISOString().replace("Z", "").split("T")

  const columns = JSON.stringify({
    date_2: { date, time },
    dup__of_is_open: { label: "Done" },
  })
  const query = `
    mutation{
      change_multiple_column_values(item_id:${designatedItemId},board_id:${designatedBoardId}, column_values:${JSON.stringify(columns)} ){
        id
      }
    }
  `
  console.log("endTracking -> query", query)
  const response = await mondayClient.api(query)
  console.log("endTracking -> response", response)
  const groupMutation = `mutation{
  move_item_to_group(item_id:${designatedItemId}, group_id:"group_title"){
    id
  }
}`
  const groupResponse = await mondayClient.api(groupMutation)
  console.log("endTracking -> groupResponse", groupResponse)
}
// export async function changeColumnValue(token, boardId, itemId, columnId, value) {
//   try {
//     const mondayClient = initMondayClient({ token })

//     const query = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
//         change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
//           id
//         }
//       }
//       `
//     const variables = { boardId, columnId, itemId, value }

//     const response = await mondayClient.api(query, { variables })
//     return response
//   } catch (err) {
//     console.log(err)
//   }
// }
