import e from 'express'
import * as mondayService from '../services/monday-service'
// import transformationService from '../services/transformation-service';

/*
  1. export the name of the original item and the name of the user.
  2. find if there is an open item in the deisgnated board
  3. create new item or update item
  3.a if item created: add the name of the original item and the username,
   date and connect boards

*/
export async function executeAction(req, res) {
  const { shortLivedToken } = req.session
  const { payload } = req.body

  try {
    const { inboundFieldValues } = payload
    const { boardId, itemId, userId, designatedBoardId } = inboundFieldValues
    console.log('file: monday-controller.ts -> line 16 -> executeAction -> boardId, itemId, userId ', boardId, itemId, userId)
    const designatedItemName = await mondayService.getDesignatedItemName(boardId, itemId, userId, shortLivedToken)
    console.log('file: monday-controller.ts -> line 25 -> executeAction -> designatedItemName', designatedItemName)

    const isItemOpen = await mondayService.isDBItemOpen(designatedItemName, designatedBoardId, shortLivedToken)

    if(isItemOpen) {

    } else {
      await mondayService.addNewItem(designatedBoardId, designatedItemName, userId, shortLivedToken)
    }

    return res.status(200).send({})
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'internal server error' })
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
