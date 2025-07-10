export const initialLikeStore = {
  userLikes: [],
  loading: false,
  error: null,
};

export default function likeReducer(store, action) {
  switch (action.type) {
    case 'set_user_likes':
      return { ...store, userLikes: action.payload, loading: false };

    case 'add_like':
      return { ...store, userLikes: [...store.userLikes, action.payload] };

    case 'remove_like':
      return {
        ...store,
        userLikes: store.userLikes.filter(
          (like) =>
            !(
              like.track_id === action.payload.track_id ||
              like.project_id === action.payload.project_id
            )
        ),
      };

    case 'set_loading':
      return { ...store, loading: true };

    case 'set_error':
      return { ...store, error: action.payload, loading: false };

    default:
      throw new Error('Acción no reconocida en likeReducer');
  }
}
