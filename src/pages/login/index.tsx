import React, { useState } from 'react'
import Head from 'next/head';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Logo from '../../../public/assets/images/logo.webp'
import Image from 'next/image';
import Link from 'next/link';
import { setCookie } from 'cookies-next';
export const metadata = {
    title: "Service Details LoomInfo - IT Solutions and Services ",
};

import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Api from '@/utils/helper/api';
import { UserRoles } from '@/utils/helper/constants';
import { Field, Form, Formik, FormikProps, useFormik } from 'formik';
import { getAuthSlice, setAuthUserData, setIsAdmin, setIsLoggedIn } from '../../../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/storeHooks';

const initialValues = {
    email: "",
    password: ""
};

const validationSchema = Yup.object({
    email: Yup.string().email().required("Please Enter Your Email"),
    password: Yup.string().required("Please Enter Your Password")
});

export default function Login() {

    const [isLoading, setIsLoading] = useState(false);
    const api = new Api();
    const router = useRouter();
    const [loginError, setLoginError] = useState('');
    const dispatch = useAppDispatch();
    const authSlice = useAppSelector(getAuthSlice);
    const organization = authSlice?.organization;

    const handleLogin = async (values: { email: string, password: string }) => {
        setIsLoading(true);
        try {
            const data = {
                email: values.email,
                password: values.password,
            }
            const res = await api.post(`/login`, data);
            if (res.status == 200 && res?.data?.token) {
                dispatch(setAuthUserData(res?.data?.userData));
                if (res?.data?.userData?.organizationId) {
                    setCookie('organizationId', res?.data?.userData?.organizationId);
                    dispatch(setIsLoggedIn(true));
                    dispatch(setIsAdmin(true));
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                }  else {
                    setTimeout(() => {
                        router.push('/organization');
                    }, 1000);
                }
                setIsLoading(false);
            } else {
                setLoginError(res?.data?.message);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            setLoginError(error?.response?.data?.message);
        }
    }
    return (
        <>
            <Head>
                <title>LoomInfo CRM Login</title>
                <meta name="description" content="Log in to access your account." />
            </Head>
            <Row>
                <Col sm={12}>
                    <div className='loginBg' style={{ backgroundImage: `url(/assets/images/crm.jpg)` }}>

                        <Card className="loginBox">
                            <Card.Body>
                                <Card.Title className="text-center">
                                    <Image height={80} width={150} className="mx-auto" src={Logo} alt="Logo" />
                                </Card.Title>
                                <Formik
                                    initialValues={initialValues}
                                    onSubmit={handleLogin}
                                    validationSchema={validationSchema}
                                >
                                    {({ errors, touched }) => (
                                        <Form>
                                            <div className="mb-3">
                                                <label htmlFor="email" className="text-white">Email address</label>
                                                <Field

                                                    name="email"
                                                    type="email"
                                                    className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                                                    placeholder="Email"
                                                />
                                                {touched.email && errors.email && (
                                                    <div className="invalid-feedback">{errors.email}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor="password" className="text-white">Password</label>
                                                <Field
                                                    name="password"
                                                    type="password"
                                                    className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                                                    placeholder="Password"
                                                />
                                                {touched.password && errors.password && (
                                                    <div className="invalid-feedback">{errors.password}</div>
                                                )}
                                                {loginError && loginError != '' ? <p className='form-error'>{loginError}</p> : null}
                                            </div>

                                            <p className="redirect text-white">
                                                {`Don't have an account?`}
                                                <span className='ms-2'>
                                                    <Link href="/signup">Sign Up</Link>
                                                </span>
                                            </p>
                                            <button type="submit" className="btn btn-primary mainBtn mx-auto d-block">
                                                Login
                                            </button>
                                        </Form>
                                    )}
                                </Formik>
                            </Card.Body>
                        </Card>


                    </div>
                </Col>
            </Row>
        </>
    )
}
