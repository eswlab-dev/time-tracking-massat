import * as mondayService from "../services/monday-service"
// import transformationService from '../services/transformation-service';
/**
 * HW
 1. when an item created in DB board
 2. add connect boards in the new item's columns in trackEmployee function
 
 */
/*
  1. export the name of the original item and the name of the user.
  2. find if there is an open item in the deisgnated board
  3. create new item or update item
  3.a if item created: add the name of the original item and the username,
   date and connect boards

*/
export async function trackEmployee(req, res) {
  const { shortLivedToken } = req.session
  const { payload } = req.body

  try {
    const { inboundFieldValues } = payload
    const { boardId, itemId, userId, designatedBoardId } = inboundFieldValues
    console.log("file: monday-controller.ts -> line 16 -> executeAction -> boardId, itemId, userId ", boardId, itemId, userId)
    const designatedItemName = await mondayService.getDesignatedItemName(boardId, itemId, userId, shortLivedToken)
    console.log("file: monday-controller.ts -> line 25 -> executeAction -> designatedItemName", designatedItemName)

    const openItem = await mondayService.getOpenItem(designatedItemName, designatedBoardId, shortLivedToken)
    console.log("executeAction -> openItem", openItem)

    if (openItem) {
      console.log("executeAction -> openItem INSIDE IF", openItem)
      await mondayService.endTracking(openItem.id, designatedBoardId, shortLivedToken)
    } else {
      await mondayService.addNewItem(designatedBoardId, designatedItemName, userId, shortLivedToken)
    }

    return res.status(200).send({})
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: "internal server error" })
  }
}

export async function taskName(req, res) {
  const { shortLivedToken } = req.session
  const { payload } = req.body

  try {
    const { inboundFieldValues } = payload
    const { boardId, itemId, userId, designatedBoardId } = inboundFieldValues
    console.log("file: monday-controller.ts -> line 53 -> taskName -> boardId, itemId, userId, designatedBoardId", boardId, itemId, userId, designatedBoardId)
    const designatedItemId = await mondayService.getDesignatedItemId(boardId, itemId, shortLivedToken)
    console.log("file: monday-controller.ts -> line 54 -> taskName -> designatedItemId", designatedItemId)
    const designatedItemName = await mondayService.getDesignatedItemName(designatedBoardId, designatedItemId, userId, shortLivedToken)
    console.log("file: monday-controller.ts -> line 56 -> taskName -> designatedItemName", designatedItemName)
    await mondayService.changeItemDetails(boardId, itemId,designatedItemName, userId, shortLivedToken)

    return res.status(200).send({})
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "internal server error" })
  }

}

// export async function getRemoteListOptions(req, res) {
//   try {
//     return res.status(200).send(TRANSFORMATION_TYPES);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send({ message: 'internal server error' });
//   }
// }
