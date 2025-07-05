export const initialFollowStore = {
  followers: [],
  following: [],
  loading: false,
  error: null,
};

export default function followReducer(store, action) {
  switch (action.type) {
    case 'set_followers':
      return {
        ...store,
        followers: action.payload,
        loading: false,
      };

    case 'set_following':
      return {
        ...store,
        following: action.payload,
        loading: false,
      };

    case 'add_follower':
      return {
        ...store,
        followers: [...store.followers, action.payload],
      };

    case 'remove_follower':
      return {
        ...store,
        followers: store.followers.filter((f) => f.id !== action.payload),
      };

    case 'add_following':
      return {
        ...store,
        following: [...store.following, action.payload],
      };

    case 'remove_following':
      return {
        ...store,
        following: store.following.filter((f) => f.id !== action.payload),
      };

    case 'set_loading':
      return {
        ...store,
        loading: true,
        error: null,
      };

    case 'set_error':
      return {
        ...store,
        loading: false,
        error: action.payload,
      };

    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}
