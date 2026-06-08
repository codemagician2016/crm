import { AuthSliceInterface, IUserData } from '@/utils/interfaces/user';
import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';
import { IOrganization } from '@/utils/interfaces/organization';

export const authSlice = createSlice({
    name: 'authSlice',
    initialState: <AuthSliceInterface>({
        isLoggedIn: false,
        isAdmin: false,
        userData: <IUserData | null>(null),
        organization: <IOrganization | null>(null)
    }),

    reducers: {
        setIsLoggedIn: (state, action) => {
            state.isLoggedIn = action.payload || false
        },
        setIsAdmin: (state, action) => {
            state.isAdmin = action.payload || false
        },
        setAuthUserData: (state, action) => {
            state.userData = action?.payload || null;
        },
        setOrganization: (state, action) => {
            state.organization = action?.payload || null;
        },
    }
});

export const getAuthSlice = (state: AppState) => state.authSlice;

export const {
    setIsLoggedIn, setIsAdmin, setAuthUserData,
    setOrganization
} = authSlice.actions;

export default authSlice.reducer;