// @ts-check

import { Far } from '@endo/marshal';
import { keyEQ } from '@agoric/store';
// eslint-disable-next-line -- https://github.com/Agoric/agoric-sdk/pull/4837
import { CONTRACT_ELECTORATE } from './paramGovernance/governParam.js';
import { assertElectorateMatches } from './paramGovernance/paramManager.js';
import { makeParamManagerFromTerms } from './paramGovernance/typedParamManager.js';

const { details: X, quote: q } = assert;

/**
 * Helper for the 90% of contracts that will have only a single set of
 * parameters. In order to support managed parameters, a contract only has to
 *   - define the parameter template, which includes name, type and value
 *   - call facetHelpers() to get augmentPublicFacet and makeGovernorFacet
 *   - add any methods needed in the public and creator facets.
 *
 *  It's also crucial that the governed contract not interact with the product
 *  of makeGovernorFacet(). The wrapped creatorFacet has the power to change
 *  parameter values, and the governance guarantees only hold if they're not
 *  used directly by the governed contract.
 *
 * @template T
 * @param {ZCF<GovernanceTerms<{}> & {
 * }>} zcf
 * @param {import('./paramGovernance/typedParamManager').TypedParamManager<T>} paramManager
 */
const facetHelpers = (zcf, paramManager) => {
  const terms = zcf.getTerms();
  const governedParams = terms.governed;
  assert(
    keyEQ(governedParams, paramManager.getParams()),
    X`Terms must include ${q(paramManager.getParams())}, but were ${q(
      governedParams,
    )}`,
  );
  assertElectorateMatches(paramManager, governedParams);

  const typedAccessors = {
    getAmount: paramManager.getAmount,
    getBrand: paramManager.getBrand,
    getInstance: paramManager.getInstance,
    getInstallation: paramManager.getInstallation,
    getInvitationAmount: paramManager.getInvitationAmount,
    getNat: paramManager.getNat,
    getRatio: paramManager.getRatio,
    getString: paramManager.getString,
    getUnknown: paramManager.getUnknown,
  };

  const { electionManager } = terms;

  /**
   * @template PF
   * @param {PF} originalPublicFacet
   * @returns {GovernedPublicFacet<PF>}
   */
  const augmentPublicFacet = originalPublicFacet => {
    return Far('publicFacet', {
      ...originalPublicFacet,
      getSubscription: () => paramManager.getSubscription(),
      getContractGovernor: () => electionManager,
      getGovernedParams: () => paramManager.getParams(),
      ...typedAccessors,
    });
  };

  /**
   * @template CF
   * @param {CF} originalCreatorFacet
   * @returns {CF & LimitedCreatorFacet}
   */
  const makeLimitedCreatorFacet = originalCreatorFacet => {
    return Far('governedContract creator facet', {
      ...originalCreatorFacet,
      getContractGovernor: () => electionManager,
    });
  };

  /**
   * @template CF
   * @param {CF} originalCreatorFacet
   * @returns { GovernedCreatorFacet<CF> }
   */
  const makeGovernorFacet = originalCreatorFacet => {
    const limitedCreatorFacet = makeLimitedCreatorFacet(originalCreatorFacet);

    // exclusively for contractGovernor, which only reveals limitedCreatorFacet
    return Far('governorFacet', {
      getParamMgrRetriever: () => {
        return Far('paramRetriever', { get: () => paramManager });
      },
      getInvitation: name => paramManager.getInternalParamValue(name),
      getLimitedCreatorFacet: () => limitedCreatorFacet,
    });
  };

  return harden({
    augmentPublicFacet,
    makeGovernorFacet,
    params: paramManager.readonly(),
  });
};

/**
 * Helper for the 90% of contracts that will have only a single set of
 * parameters. In order to support managed parameters, a contract only has to
 *   - define the parameter template, which includes name, type and value
 *   - call facetHelpers() to get augmentPublicFacet and makeGovernorFacet
 *   - add any methods needed in the public and creator facets.
 *
 *  It's also crucial that the governed contract not interact with the product
 *  of makeGovernorFacet(). The wrapped creatorFacet has the power to change
 *  parameter values, and the governance guarantees only hold if they're not
 *  used directly by the governed contract.
 *
 * @template {import('./paramGovernance/typedParamManager').ParamTypesMap} M Map of types of custom governed terms
 * @template {Record<string, ParamRecord>} CGT Custom governed terms
 * @param {ZCF<GovernanceTerms<CGT>>} zcf
 * @param {Invitation} initialPoserInvitation
 * @param {M} paramTypesMap
 */
const handleParamGovernance = async (
  zcf,
  initialPoserInvitation,
  paramTypesMap,
) => {
  const paramManager = await makeParamManagerFromTerms(
    zcf,
    initialPoserInvitation,
    paramTypesMap,
  );

  return facetHelpers(zcf, paramManager);
};

harden(facetHelpers);
harden(handleParamGovernance);

export { facetHelpers, handleParamGovernance };
