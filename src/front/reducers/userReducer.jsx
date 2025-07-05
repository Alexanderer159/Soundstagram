import { useContext, useReducer, createContext } from "react";
import userReducer, { initialUserStore } from "../stores/userStore";

// Creamos un contexto específico para el usuario
const UserContext = createContext();

// Proveedor que encapsula el user store
export function UserProvider({ children }) {
  const [store, dispatch] = useReducer(userReducer, initialUserStore());

  return (
    <UserContext.Provider value={{ store, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizado para acceder fácilmente al contexto de usuario
export function useUserReducer() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserStore debe usarse dentro de <UserProvider>");
  return context;
}
