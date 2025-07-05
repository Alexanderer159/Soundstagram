export const initialChatStore = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

export default function chatReducer(state, action) {
  switch (action.type) {
    case 'set_chats':
      return {
        ...state,
        chats: action.payload,
        loading: false,
      };

    case 'set_current_chat':
      return {
        ...state,
        currentChat: action.payload,
        messages: [],
        loading: false,
      };

    case 'set_messages':
      return {
        ...state,
        messages: action.payload,
        loading: false,
      };

    case 'add_message':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'add_chat':
      return {
        ...state,
        chats: [...state.chats, action.payload],
      };

    case 'set_loading':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'set_error':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}
