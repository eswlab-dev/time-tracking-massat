import * as mondayService from '../services/monday-service'
import * as Types from '../constants/Types.d'

export async function trackEmployee(req, res): Promise<object> {
  const { shortLivedToken } = req.session
  const { payload } = req.body

  try {
    const { inboundFieldValues } = payload
    const { boardId, itemId, userId } = inboundFieldValues
    const UserTeamDetails: Types.UserTeamDetails | undefined = await mondayService.getUserTeamDetails(userId, shortLivedToken)
    const isUserCanAssign: boolean | undefined = await mondayService.checkIfUserCanAssign(boardId, itemId, userId, UserTeamDetails?.id, shortLivedToken)
    console.log('file: monday-controller.ts -> line 29 -> trackEmployee -> isUserCanAssign', isUserCanAssign)

    if (isUserCanAssign) {
      const designatedItemName: Types.DesignatedItem | undefined = await mondayService.getDesignatedItemName(boardId, itemId, userId, shortLivedToken)
      const buildName: string = `${designatedItemName?.username} ➡️ ${designatedItemName?.itemName}`
      const designatedBoardId: number | undefined = await mondayService.getDesignatedBoardId(UserTeamDetails?.name, shortLivedToken)
      const isUserAssigned: Types.QueryValue | null | undefined = await mondayService.checkAndAssignUser(boardId, itemId, userId, shortLivedToken)
      console.log('file: monday-controller.ts -> line 33 -> trackEmployee -> isUserAssigned', isUserAssigned)
      if (isUserAssigned) {
        const designatedItem: Types.Item | undefined = await mondayService.getDesignatedItem(buildName, designatedBoardId!, shortLivedToken)
        await mondayService.endTracking(designatedBoardId, designatedItem!.id, shortLivedToken)
      } else {
        await mondayService.addNewItem(designatedBoardId!, buildName, userId, shortLivedToken)
      }
    } else if (isUserCanAssign === undefined) {
      await mondayService.notify(userId, itemId, shortLivedToken, `Assignment failed. Please fill Team/Manager/Reviewer columns in order to assign (${itemId}).`)
    } else if (isUserCanAssign === false) {
      await mondayService.notify(userId, itemId, shortLivedToken, `Assignment failed. Please make sure that you are not already assigned or connected to the task (${itemId}).`)
    }

    return res.status(200).send({})
  } catch (err) {
    console.error(err)
    return res.status(500).send({ message: 'internal server error' })
  }
}
