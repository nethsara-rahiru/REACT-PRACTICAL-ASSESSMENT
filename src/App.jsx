import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import CountryDetails from "./pages/CountryDetails";
import Compare from "./pages/Compare";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import "./App.css";
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="explore" element={<Explore />} />
            <Route path="country/:code" element={<CountryDetails />} />
            <Route path="compare" element={<Compare />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
