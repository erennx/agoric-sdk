// @ts-check

import { handleParamGovernance } from '../../../src/contractHelper.js';
import { ParamTypes } from '../../../src/index.js';
import { CONTRACT_ELECTORATE } from '../../../src/paramGovernance/governParam.js';

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
 * GovernanceTerms<{
 *   MalleableNumber: ParamRecord<'nat'>,
 * }>,
 * {initialPoserInvitation: Payment}>
 */
const start = async (zcf, privateArgs) => {
  const { augmentPublicFacet, makeGovernorFacet } = await handleParamGovernance(
    zcf,
    privateArgs.initialPoserInvitation,
    {
      [MALLEABLE_NUMBER]: ParamTypes.NAT,
    },
  );

  return {
    publicFacet: augmentPublicFacet({}),
    creatorFacet: makeGovernorFacet({}),
  };
};

harden(start);
harden(MALLEABLE_NUMBER);
harden(makeParamTerms);

export { start, MALLEABLE_NUMBER, makeParamTerms };
