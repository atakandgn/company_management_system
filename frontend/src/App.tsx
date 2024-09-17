import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Layout } from "antd";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import Products from "./pages/Products";
import Sidebar from "./components/Sidebar";
import Authenticate from "./pages/Authenticate";
import Settings from "./pages/Settings";
import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import { isAuthenticated, clearToken } from "./utils/authUtils";
import { initializeDarkMode, setDarkMode } from "./utils/themeUtils";

const { Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const location = useLocation(); 

  useEffect(() => {
    checkAuthentication();
    initializeDarkMode();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkModeState(true);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [location]);

  const checkAuthentication = () => {
    const tokenValid = isAuthenticated();
    setIsAuth(tokenValid);
    if (!tokenValid) {
      clearToken(); 
    }
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    setDarkModeState(checked);
  };

  return (
    <Layout className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      {isAuth && <Sidebar darkMode={darkMode} />}
      <Layout className="flex-1 flex flex-col bg-gray_color dark:bg-gray-900">
        <Content className="flex-grow flex p-8 justify-center items-center h-max relative">
          <Routes>
            <Route
              path="/authenticate"
              element={!isAuth ? <Authenticate /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={isAuth ? <Home /> : <Navigate to="/authenticate" />}
            />
            <Route
              path="/companies"
              element={isAuth ? <Companies /> : <Navigate to="/authenticate" />}
            />
            <Route
              path="/products"
              element={isAuth ? <Products /> : <Navigate to="/authenticate" />}
            />
            <Route
              path="/settings"
              element={isAuth ? (
                <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              ) : (
                <Navigate to="/authenticate" />
              )}
            />
          </Routes>
        </Content>
        {isAuth && (
          <Footer className="bg-white dark:bg-[#002140] border-t border-gray-100  text-center !py-3 dark:border-2 dark:border-[#002140]">
            <span className="text-black dark:text-gray-200 py-1.5">
              ETE Technology ©2024 Created by Atakan Doğan
            </span>
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={enUS}>
      <Router>
        <AppContent />
      </Router>
    </ConfigProvider>
  );
};

export default App;
