import { createContext, useContext } from "react";
export const AppContext = createContext(null);
export const defaults = { name: "", region: "", country: "", sort: "name" };
export const useApp = () => useContext(AppContext);
