import "../styles/globals.scss";
import RouteGuard from "@/commoncomponent/routerguard";
import axios from 'axios';
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { wrapper } from "../../redux/store";
import { setAuthUserData, setIsAdmin, setIsLoggedIn, setOrganization } from "../../redux/slices/authSlice";
import { PersistGate } from "redux-persist/integration/react";
import Header from "@/template/header";
import { createTheme, ThemeProvider } from "@mui/material";
import Api from "@/utils/helper/api";
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from "next/router";
import { deleteCookie } from 'cookies-next';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

const theme = createTheme({
  palette: {
    primary: {
      main: '#10375C',
      contrastText: '#fff',
    },
    info: {
      main: '#fff',
    
    },
    secondary: {
      main: '#EB8317',
      light: '#F5EBFF',
      contrastText: '#47008F',
    },
  
  },
});
function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {

  const { store } = wrapper.useWrappedStore(pageProps);
  axios.defaults.withCredentials = true;
  const api = new Api();
  const router = useRouter();
  const organizationId = getCookie('organizationId');

  axios.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    const status = error.response?.status || 500;
    if (status === 401 || status === 403) {
      store?.dispatch(setAuthUserData(null));
      store?.dispatch(setIsLoggedIn(false));
      store?.dispatch(setIsAdmin(false));
      store?.dispatch(setOrganization(null));
      deleteCookie('organizationId');
      router.push("/login");
    } else {
      return Promise.reject(error); // Delegate error to calling side
    }
  });

  const logoutUser = async () => {
    const response = await api.post(`/logout`);
    if (response.data?.success) {
      store?.dispatch(setAuthUserData(null));
      store?.dispatch(setIsLoggedIn(false));
      store?.dispatch(setIsAdmin(false));
      store?.dispatch(setOrganization(null));
      deleteCookie('organizationId');
      router.push('/login');
    }
  }

  const getOrganization = async () => {
    try {
      const response = await api.get(`/organization/detail`);
      if (response.status === 200) {
        store?.dispatch(setOrganization(response?.data?.data || null));
      }
    } catch (error) {
      logoutUser();
      console.log("get organization error", error);
    }
  }

  useEffect(() => {
    if (router.pathname === '/' && store?.authSlice?.userData?.organizationId) {
      getOrganization();
    }
  }, [router.pathname])

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={store.__persistor}>
          <div className="flex">
            <RouteGuard>
              {/* Sidebar always visible */}
              <Header />
              <main className="flex-grow">
                {/* Render the current page */}
                <Component {...pageProps} />
              </main>
            </RouteGuard>
          </div>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}

export default MyApp;
