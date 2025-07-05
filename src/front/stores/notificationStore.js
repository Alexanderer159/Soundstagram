export const initialNotificationStore = {
  notifications: [],
  loading: false,
  error: null,
};

export default function notificationReducer(state, action) {
  switch (action.type) {
    case 'set_notifications':
      return { ...state, notifications: action.payload, loading: false };

    case 'mark_as_read':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };

    case 'delete_notification':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case 'set_loading':
      return { ...state, loading: true };

    case 'set_error':
      return { ...state, error: action.payload, loading: false };

    default:
      throw new Error('Acción no reconocida en notificationReducer');
  }
}
