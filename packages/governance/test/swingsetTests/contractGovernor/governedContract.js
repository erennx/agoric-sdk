// @ts-check

import { handleParamGovernance } from '../../../src/contractHelper.js';
import { assertElectorateMatches, ParamTypes } from '../../../src/index.js';
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
// XXX passing full zcf and privateArgs simplifies the caller but isn't POLA
const start = async (zcf, privateArgs) => {
  const paramManager = await makeParamManagerFromTerms(zcf, privateArgs, {
    [MALLEABLE_NUMBER]: 'nat',
    [CONTRACT_ELECTORATE]: 'invitation',
  });

  // ??? call this within makeParamManagerFromTerms ?
  assertElectorateMatches(paramManager, zcf.getTerms().main);

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
