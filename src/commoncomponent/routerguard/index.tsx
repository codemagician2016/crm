import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice } from '../../../redux/slices/authSlice';
import pagePermissions from '../../../assets/pagePermission.json';
import AccessRestricted from '../accessrestricted';
import { AuthSliceInterface, IUserData } from '@/utils/interfaces/user';
import React from 'react';
import Sidebar from '../../template/header';
import { UserRoles } from '@/utils/helper/constants';

function RouteGuard({ children }: any) {
    const router = useRouter();
    const authSlice = useAppSelector(getAuthSlice);
    const [authorized, setAuthorized] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const authUserSliceRef = useRef<AuthSliceInterface | null>(null);

    useEffect(() => {
        // on initial load - run auth check 
        authCheck(router.pathname, true);

        const hideContent = () => {
            // setAuthorized(false);
            setAuthChecked(false);
        }

        // on route change start
        router.events.on("routeChangeStart", hideContent)

        // // on route change complete - run auth check 
        router.events.on('routeChangeComplete', (url) => {
            authCheck(url);
        })

        // added reload due to issue of double router push within short period
        router.events.on("routeChangeError", (err) => {
            console.log("router error", err);
        })

        // unsubscribe from events in useEffect return function
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', (url) => {
                authCheck(url);
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        authUserSliceRef.current = authSlice;
    }, [authSlice]);

    function authCheck(url: string, isInitialLoad = false) {
        // redirect to login page if accessing a private page and not logged in 
        const path = url;
        const homePath = '/login';

        const authSliceData = isInitialLoad ? (authSlice || null) : (authUserSliceRef?.current || null);
        const publicPaths = pagePermissions["public"] || [];
        let isPublicPath = false;
        if (path == homePath) {
            isPublicPath = true;
        } else {
            isPublicPath = !!publicPaths.find((val: string) => path?.includes(val));
        }

        const userData: IUserData | null = authSliceData ? authSliceData?.userData : null;
        const isLoggedIn = authSliceData?.isLoggedIn && userData?.role;

        if (isPublicPath) {
            if (userData?.role === UserRoles.ADMIN) {
                if (authSliceData?.userData?.organizationId) {
                    if (path === '/organization') {
                        router.push('/');
                    }
                    setAuthorized(true);
                } else {
                    if (authSliceData?.userData?._id) {
                        if (path !== '/organization') {
                            router.push('/organization');
                        }
                        setAuthorized(true);
                    } else {
                        router.push('/login');
                        setAuthorized(false);
                    }
                }
            } else {
                if (path === '/organization') {
                    router.push('/login');
                    setAuthorized(false);
                } else {
                    setAuthorized(true);
                }
            }
        } else {
            if (isLoggedIn) {
                const accessibleRoutes = userData?.role ? (pagePermissions[userData?.role] || []) : [];
                const isAccessibleRoute = accessibleRoutes.find((val: string) => path?.includes(val));
                if (isAccessibleRoute) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            } else {
                router.push('/login');
                setAuthorized(false);
            }
        }

        setAuthChecked(true);
    }

    if (!authorized && authChecked) {
        return (
            <>
                <Sidebar />
                <AccessRestricted />
            </>
        )
    }

    return (authorized && children);
}

export default RouteGuard;