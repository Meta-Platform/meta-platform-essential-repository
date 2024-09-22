const DeepMergeObjects = require("../../Utils/DeepMergeObjects")

const AssembleLinkedTaskParameters = require("./AssembleLinkedTaskParameters")

const AssembleTaskParameters = (taskStateManager, { staticParameters, linkedParameters, agentLinkRules }) => {
    const staticParamMounted = staticParameters ? staticParameters : {}
    const linkedParamMounted = linkedParameters ? AssembleLinkedTaskParameters({ taskStateManager, agentLinkRules, linkedParameters }) : {}
    return DeepMergeObjects(staticParamMounted, linkedParamMounted)
}

module.exports = AssembleTaskParameters