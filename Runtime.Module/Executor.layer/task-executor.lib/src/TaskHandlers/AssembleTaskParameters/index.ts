const DeepMergeObjects = require("../../Utils/DeepMergeObjects")

const AssembleLinkedTaskParameters = require("./AssembleLinkedTaskParameters")

const AssembleTaskParameters = (taskStateManager: any, { staticParameters, linkedParameters, agentLinkRules }: any) => {
    const staticParamMounted = staticParameters ? staticParameters : {}
    const linkedParamMounted = linkedParameters ? AssembleLinkedTaskParameters({ taskStateManager, agentLinkRules, linkedParameters }) : {}
    return DeepMergeObjects(staticParamMounted, linkedParamMounted)
}

module.exports = AssembleTaskParameters