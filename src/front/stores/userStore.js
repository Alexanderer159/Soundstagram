export const initialUserStore = () => {
  const savedUser = JSON.parse(localStorage.getItem('user')) || {};
  const savedToken = localStorage.getItem('token') || '';
  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
  };
};

export default function userReducer(store, action = {}) {
  switch (action.type) {
    case 'login_success':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };

    case 'update_user':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...store,
        user: action.payload,
      };

    case 'logout':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false,
      };

    default:
      throw Error('Unknown action.');
  }
}
