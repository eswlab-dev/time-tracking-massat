import * as mondayService from '../services/monday-service'
import * as Types from "../constants/Types.d"
// import { DesignatedItem } from '../models/item'
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

export async function trackEmployee(req, res): Promise<object> {
  const { shortLivedToken } = req.session
  const { payload } = req.body

  try {
    const { inboundFieldValues } = payload
    const { boardId, itemId, userId } = inboundFieldValues
    const UserTeamDetails: Types.UserTeamDetails | undefined = await mondayService.getUserTeamDetails(userId, shortLivedToken)
    const isUserCanAssign: boolean | undefined = await mondayService.checkIfUserCanAssign(boardId, itemId, userId, UserTeamDetails?.id, shortLivedToken)
    console.log("file: monday-controller.ts -> line 29 -> trackEmployee -> isUserCanAssign", isUserCanAssign)

    if(isUserCanAssign) {
      const designatedBoardId = await mondayService.getDesignatedBoardId(UserTeamDetails?.name, shortLivedToken)
      const isUserAssigned = await mondayService.checkAndAssignUser(boardId, itemId, userId, shortLivedToken)
      console.log("file: monday-controller.ts -> line 33 -> trackEmployee -> isUserAssigned", isUserAssigned)



    } else if(isUserCanAssign === undefined) {
      await mondayService.notify(userId, itemId, shortLivedToken, `Assignment failed. Please fill Team/Manager/Reviewer columns in order to assign (${itemId}).`)
    } else if(isUserCanAssign === false) {
      await mondayService.notify(userId, itemId, shortLivedToken, `Assignment failed. Please make sure that you are not already assigned or connected to the task (${itemId}).`)
    }

    // console.log('file: monday-controller.ts -> line 16 -> executeAction -> boardId, itemId, userId ', boardId, itemId, userId)
    // const designatedItemName: Types.DesignatedItem | undefined = await mondayService.getDesignatedItemName(boardId, itemId, userId, shortLivedToken)
    // const buildName: string = `${designatedItemName?.username} ➡️ ${designatedItemName?.itemName}`
    // console.log('file: monday-controller.ts -> line 25 -> executeAction -> designatedItemName', designatedItemName)
    // const openItem: Types.Item | undefined = await mondayService.getOpenItem(buildName, designatedBoardId, shortLivedToken)
    // console.log('executeAction -> openItem', openItem)

    // if (openItem) {
    //   console.log('executeAction -> openItem INSIDE IF', openItem)
    //   await mondayService.endTracking(openItem.id, designatedBoardId, shortLivedToken)
    // } else {
    //   await mondayService.addNewItem(designatedBoardId, buildName, itemId, userId, shortLivedToken)
    // }

    return res.status(200).send({})
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'internal server error' })
  }
}

// export async function changeItemDetails(req, res): Promise<object> {
//   const { shortLivedToken } = req.session
//   const { payload } = req.body

//   try {
//     const { inboundFieldValues } = payload
//     const { boardId, itemId, userId, designatedBoardId } = inboundFieldValues
//     console.log('file: monday-controller.ts -> line 53 -> taskName -> boardId, itemId, userId, designatedBoardId', boardId, itemId, userId, designatedBoardId)
//     const designatedItemId: number | false | undefined = await mondayService.getDesignatedItemId(boardId, itemId, shortLivedToken)
//     console.log('file: monday-controller.ts -> line 54 -> taskName -> designatedItemId', designatedItemId)
//     if (designatedItemId) {
//       const designatedItemName: Types.DesignatedItem | undefined = await mondayService.getDesignatedItemName(designatedBoardId, designatedItemId, userId, shortLivedToken)
//       console.log('file: monday-controller.ts -> line 56 -> taskName -> designatedItemName', designatedItemName)

//       const buildName: string = `${designatedItemName?.username} ➡️ ${designatedItemName?.itemName}`
//       await mondayService.changeItemDetails(boardId, itemId, buildName, userId, shortLivedToken)
//     }

//     return res.status(200).send({})
//   } catch (err) {
//     console.log(err)
//     return res.status(500).send({ message: 'internal server error' })
//   }
// }
