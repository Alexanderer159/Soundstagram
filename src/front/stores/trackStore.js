export const initialTrackStore = {
  tracks: [],
  currentTrack: null,
  loading: false,
  error: null,
};

export default function trackReducer(store, action) {
  switch (action.type) {
    case 'set_tracks':
      return {
        ...store,
        tracks: action.payload,
        loading: false,
      };

    case 'set_current_track':
      return {
        ...store,
        currentTrack: action.payload,
        loading: false,
      };

    case 'add_track':
      return {
        ...store,
        tracks: [...store.tracks, action.payload],
      };

    case 'update_track':
      return {
        ...store,
        tracks: store.tracks.map((t) => (t.id === action.payload.id ? action.payload : t)),
        currentTrack:
          store.currentTrack?.id === action.payload.id ? action.payload : store.currentTrack,
      };

    case 'delete_track':
      return {
        ...store,
        tracks: store.tracks.filter((t) => t.id !== action.payload),
        currentTrack: store.currentTrack?.id === action.payload ? null : store.currentTrack,
      };

    case 'approve_track':
    case 'reject_track':
      return {
        ...store,
        tracks: store.tracks.map((t) => (t.id === action.payload.id ? action.payload : t)),
        currentTrack:
          store.currentTrack?.id === action.payload.id ? action.payload : store.currentTrack,
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
