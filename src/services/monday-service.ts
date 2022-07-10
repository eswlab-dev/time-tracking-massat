import initMondayClient from 'monday-sdk-js'

export async function getDesignatedItemName(boardId, itemId, userId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
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
    const username = response.data.users[0].name
    const itemName = response.data.boards[0].items[0].name
    console.log("file: monday-service.ts -> line 24 -> getDesignatedItemName -> itemName", itemName)
    
    const designatedItemName = `${username} - ${itemName}`
    return designatedItemName
  } catch (err) {
    console.log(err)
  }
}

export async function getDesignatedItemId(boardId, itemId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    const query = `{
          boards(ids: ${boardId}) {
            items(ids: ${itemId}) {
              column_values(ids: "connect_boards1") {
                value
              }
            }
          }
      }`
    console.log('file: monday-service.ts -> line 45-> getDesignatedItemId -> query', query)
    const response = await mondayClient.api(query)
    const value = JSON.parse(response.data.boards[0].items[0].column_values[0].value)
    console.log('file: monday-service.ts -> line 48 -> getDesignatedItemId -> value', value)
    const linkedPulsedId = value.linkedPulseIds[0].linkedPulseId
    console.log('file: monday-service.ts -> line 50 -> getDesignatedItemId -> linkedPulsedId', linkedPulsedId)
    return linkedPulsedId
  } catch (err) {
    console.log(err)
  }
}

export async function getOpenItem(designatedItemName, designatedBoardId, token) {
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    console.log('designatedBoardId', designatedBoardId)
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

    console.log('getOpenItem -> query', query)
    const response = await mondayClient.api(query)
    console.log('getOpenItem -> response', response)
    const items = response.data.boards[0].groups[0].items
    console.log('getOpenItem -> items', items)
    const item = items.find((item) => item.name === designatedItemName)
    console.log('getOpenItem -> item', item)
    return item
  } catch (err) {
    console.log('getOpenItem -> err', err)
  }
}

export async function addNewItem(designatedBoardId, designatedItemName, userId, token) {
  console.log('addNewItem -> designatedItemName', designatedItemName)
  try {
    const mondayClient = initMondayClient()
    await mondayClient.setToken(token)
    const [date, time] = new Date().toISOString().replace('Z', '').split('T')
    const columnValues = JSON.stringify({
      dup__of_is_open: { label: 'Tracking' },
      date_1: { date, time },
      person: { personsAndTeams: [{ id: userId, kind: 'person' }] },
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
    console.log('addNewItem -> query', query)

    const response = await mondayClient.api(query)
    console.log('file: monday-service.ts -> line 68 -> addNewItem -> response', response.data)
    console.log('file: monday-service.ts -> line 68 -> addNewItem -> response', response.data.create_item.column_values)
  } catch (err) {
    console.log(err)
  }
}
export async function endTracking(designatedItemId, designatedBoardId, token) {
  const mondayClient = initMondayClient()
  await mondayClient.setToken(token)
  const [date, time] = new Date().toISOString().replace('Z', '').split('T')

  const columns = JSON.stringify({
    date_2: { date, time },
    dup__of_is_open: { label: 'Done' },
  })
  const query = `
    mutation{
      change_multiple_column_values(item_id:${designatedItemId},board_id:${designatedBoardId}, column_values:${JSON.stringify(columns)} ){
        id
      }
    }
  `
  console.log('endTracking -> query', query)
  const response = await mondayClient.api(query)
  console.log('endTracking -> response', response)
  const groupMutation = `mutation{
  move_item_to_group(item_id:${designatedItemId}, group_id:"group_title"){
    id
  }
}`
  const groupResponse = await mondayClient.api(groupMutation)
  console.log('endTracking -> groupResponse', groupResponse)
}

export async function changeItemDetails(boardId, itemId, designatedItemName, userId, token) {
  console.log('file: monday-service.ts -> line 147 -> changeItemDetails -> boardId, itemId,designatedItemName', boardId, itemId, designatedItemName)
  const mondayClient = initMondayClient()
  await mondayClient.setToken(token)

  const columns = JSON.stringify({
    name: designatedItemName,
    person: { personsAndTeams: [{ id: userId, kind: 'person' }] },
    dup__of_is_open: { label: 'Tracking' },
  })

  const query = `
  mutation{
    change_multiple_column_values(item_id:${itemId},board_id:${boardId}, column_values: ${JSON.stringify(columns)}){
      id
    }
  }
`

  console.log('endTracking -> query', query)
  const response = await mondayClient.api(query)
  console.log('endTracking -> response', response)
  const groupMutation = `mutation{
                             move_item_to_group(item_id:${itemId}, group_id:"new_group"){
                              id
                              }
                          }`
                          
  const groupResponse = await mondayClient.api(groupMutation)
  console.log('endTracking -> groupResponse', groupResponse)
}
