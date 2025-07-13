export const initialProjectStore = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

export default function projectReducer(state, action) {
  switch (action.type) {
    case 'set_projects':
      return { ...state, projects: action.payload, loading: false };

    case 'add_project':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'update_project':
      const updatedProject = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
        selectedProject:
          state.selectedProject?.id === updatedProject.id ? updatedProject : state.selectedProject,
      };

    case 'delete_project':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    case 'set_selected_project':
      return { ...state, selectedProject: action.payload };

    case 'set_loading':
      return { ...state, loading: true };

    case 'set_error':
      return { ...state, error: action.payload, loading: false };

    default:
      throw new Error('Acción no reconocida en projectReducer');
  }
}
