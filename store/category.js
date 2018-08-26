export const state = () => {
  return {
    categories: {
      list: []
    }
  }
};

export const mutations = {
  LOAD_CATEGORIES(state, data) {
    state.categories.list = [...data];
  }
};
