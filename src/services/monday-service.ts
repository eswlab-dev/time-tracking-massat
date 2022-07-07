import initMondayClient from 'monday-sdk-js'

export async function getDesignatedItemName(boardId, itemId, userId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('mondayClient', mondayClient)
    console.log('file: monday-service.ts -> line 4 -> getItemDetails -> boardId, itemId, userId, token', boardId, itemId, userId, token)

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
    console.log('file: monday-service.ts -> line 12 -> getItemDetails -> query', query)

    const response = await mondayClient.api(query)
    const username = JSON.stringify(response.data.users[0].name)
    const itemName = JSON.stringify(response.data.boards[0].items[0].name)

    const designatedItemName = `${username} - ${itemName}`

    return designatedItemName.replace(/['"]+/g, '')
  } catch (err) {
    console.log(err)
  }
}

export async function isDBItemOpen(designatedItemName, designatedBoardId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('designatedBoardId', designatedBoardId)
    const query = `	{
      items_by_column_values (board_id: ${designatedBoardId}, column_id: "status2", column_value: "Working on it") {
        name
      }
    }`
    const response = await mondayClient.api(query)
    const columnValues = response.data.items_by_column_values
         
    return columnValues.some(val => designatedItemName === val.name)

  } catch (err) {
    console.log(err)
  }
}


export async function addNewItem(designatedBoardId, designatedItemName, userId, token) {
    try {
      console.log(designatedItemName)
      const mondayClient = initMondayClient()
      await mondayClient.setToken(token)

      const query = `mutation {
        create_item(board_id: ${designatedBoardId}, item_name: "${designatedItemName}", column_values) {
          id
        }
      }`

   const response =  await mondayClient.api(query)
   console.log("file: monday-service.ts -> line 68 -> addNewItem -> response", response)   
    } catch(err) {
      console.log(err)
    }
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
