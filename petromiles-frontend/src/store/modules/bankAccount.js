import httpClient from "@/http/http-client";

export const namespaced = true;
export const state = {
  userDetails: null,
  bankAccount: null,
};

export const mutations = {
  SET_USER_DETAILS(state, userDetailsData) {
    state.userDetails = userDetailsData;
  },

  SET_BANK_ACCOUNT(state, bankAccount) {
    state.bankAccount = bankAccount;
  },
};

export const actions = {
  setUserDetails({ commit, rootState }, userDetailsData) {
    if (rootState.auth.user !== null) {
      if (userDetailsData.email !== rootState.auth.user.email) {
        commit("SET_USER_DETAILS", userDetailsData);
      }
    } else {
      commit("SET_USER_DETAILS", userDetailsData);
    }
  },
  async setBankAccount({ commit, state }, bankAccount) {
    commit("SET_BANK_ACCOUNT", bankAccount);
    const account = {
      userDetails: state.userDetails,
      accountNumber: state.bankAccount.accountNumber,
      routingNumber: state.bankAccount.routingNumber,
      type: state.bankAccount.type,
      checkNumber: state.bankAccount.checkNumber,
    };

    await httpClient.post("/bank-account", account);
  },
};

export const getters = {
  getBankAccountDetails(state) {
    return { bankAccount: state.bankAccount, userDetails: state.userDetails };
  },
};