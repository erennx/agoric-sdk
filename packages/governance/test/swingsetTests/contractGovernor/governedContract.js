// @ts-check

import { handleParamGovernance } from '../../../src/contractHelper.js';
import { ParamTypes } from '../../../src/index.js';
import { CONTRACT_ELECTORATE } from '../../../src/paramGovernance/governParam.js';
import { makeParamManagerFromTerms } from '../../../src/paramGovernance/typedParamManager.js';

const MALLEABLE_NUMBER = 'MalleableNumber';

const makeParamTerms = (number, invitationAmount) => {
  return harden({
    [MALLEABLE_NUMBER]: { type: ParamTypes.NAT, value: number },
    [CONTRACT_ELECTORATE]: {
      type: ParamTypes.INVITATION,
      value: invitationAmount,
    },
  });
};

/**
 * @type ContractStartFn<
 * GovernedPublicFacet<{}>,
 * GovernedCreatorFacet<any>,
 * {
 *   electionManager: VoteOnParamChange,
 *   main: {
 *     MalleableNumber: ParamRecord<'nat'>,
 *     Electorate: ParamRecord<'invitation'>,
 *   },
 * },
 * {initialPoserInvitation: Payment}>
 */
const start = async (zcf, privateArgs) => {
  const paramManager = await makeParamManagerFromTerms(zcf, privateArgs, {
    [MALLEABLE_NUMBER]: ParamTypes.NAT,
    [CONTRACT_ELECTORATE]: ParamTypes.INVITATION,
  });

  const { wrapPublicFacet, wrapCreatorFacet } = handleParamGovernance(
    zcf,
    paramManager,
  );

  return {
    publicFacet: wrapPublicFacet({}),
    creatorFacet: wrapCreatorFacet({}),
  };
};

harden(start);
harden(MALLEABLE_NUMBER);
harden(makeParamTerms);

export { start, MALLEABLE_NUMBER, makeParamTerms };
