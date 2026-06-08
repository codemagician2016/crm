import React, { useState } from 'react'
import Head from 'next/head';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Logo from '../../../public/assets/images/logo.webp'
import Image from 'next/image';
import Link from 'next/link';
export const metadata = {
    title: "Service Details LoomInfo - IT Solutions and Services ",
};

import * as Yup from 'yup';
import { useRouter } from 'next/router';
import Api from '@/utils/helper/api';
import { UserRoles } from '@/utils/helper/constants';
import { Field, Form, Formik, FormikProps, useFormik } from 'formik';
import { useAppDispatch } from '../../../redux/storeHooks';

const initialValues = {
    email: "",
    phoneNo: "",
    name: "",
    totalUser: "",
};

const validationSchema = Yup.object({
    email: Yup.string().email().required("Please Enter Your Email"),
    phoneNo: Yup.string().required("Please Enter Your Phone No."),
    name: Yup.string().required("Please Enter Your Name"),
    totalUser: Yup.number().required("Please Enter total user")
});

export default function SignUp() {

    const [isLoading, setIsLoading] = useState(false);
    const api = new Api();
    const router = useRouter();
    const [loginError, setLoginError] = useState('');
    const dispatch = useAppDispatch();

    const handleSignUp = async (values: { email: string, phoneNo: string, name: string, totalUser: string }) => {
        setIsLoading(true);
        try {
            const data = {
                email: values.email,
                phoneNo: values.phoneNo,
                name: values.name,
                totalUser: values.totalUser,
            }
            const res = await api.put(`/register`, data);
            if (res.status == 200) {
                router.push('/login');
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

                        <Card className='signUpBox'>
                            <Card.Body>
                                <Card.Title className='text-center'>
                                    <Image height={80} width={150} className='mx-auto' src={Logo} alt='Logo' />
                                </Card.Title>
                                <Formik
                                    initialValues={initialValues}
                                    onSubmit={handleSignUp}
                                    validationSchema={validationSchema}
                                >
                                    {({ errors, touched }) => (
                                        <Form>
                                            <div>
                                                <Row>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className='text-white'>Name</label>
                                                            <Field

                                                                name="name"
                                                                type="text"
                                                                className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                                                                placeholder="Name"
                                                            />
                                                            {touched.name && errors.name && (
                                                                <div className="invalid-feedback">{errors.name}</div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className='text-white'>Mobile No</label>
                                                            <Field

                                                                name="phoneNo"
                                                                type="number"
                                                                className={`form-control ${touched.phoneNo && errors.phoneNo ? 'is-invalid' : ''}`}
                                                                placeholder="Phone No."
                                                            />
                                                            {touched.phoneNo && errors.phoneNo && (
                                                                <div className="invalid-feedback">{errors.phoneNo}</div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className='text-white'>Company Email</label>
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
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <label className='text-white'>No Of User</label>
                                                            <Field

                                                                name="totalUser"
                                                                type="text"
                                                                className={`form-control ${touched.totalUser && errors.totalUser ? 'is-invalid' : ''}`}
                                                                placeholder="Total User"
                                                            />
                                                            {touched.totalUser && errors.totalUser && (
                                                                <div className="invalid-feedback">{errors.totalUser}</div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <p className='redirect'>
                                                    Already Have an Account? <span><Link href="login">Login</Link></span>
                                                </p>
                                                <Button type="submit" className='mainBtn mx-auto d-block' variant="primary">SignUp</Button>
                                            </div>
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
