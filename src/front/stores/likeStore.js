export const initialLikeStore = {
  userLikes: [], // likes del usuario logueado
  loading: false,
  error: null,
};

export default function likeReducer(state, action) {
  switch (action.type) {
    case 'set_user_likes':
      return { ...state, userLikes: action.payload, loading: false };

    case 'add_like':
      return { ...state, userLikes: [...state.userLikes, action.payload] };

    case 'remove_like':
      return {
        ...state,
        userLikes: state.userLikes.filter(
          (like) =>
            !(
              like.track_id === action.payload.track_id ||
              like.project_id === action.payload.project_id
            )
        ),
      };

    case 'set_loading':
      return { ...state, loading: true };

    case 'set_error':
      return { ...state, error: action.payload, loading: false };

    default:
      throw new Error('Acción no reconocida en likeReducer');
  }
}
