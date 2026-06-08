import { IAddOrganization, IUpdateOrganization } from "@/utils/interfaces/organization";
import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { setCookie } from 'cookies-next';
import Logo from '../../../public/assets/images/logo.webp'
import Image from 'next/image';
import CardComponent from "@/commoncomponent/Card";
import Loader from "@/commoncomponent/Loader";
import Api from "@/utils/helper/api";
import { getCookie } from "cookies-next";
import { ISnackbar } from "@/utils/interfaces/common";
import { Alert, Snackbar } from "@mui/material";
import SaveLoader from "@/commoncomponent/Loader/saveLoader";
import { getAuthSlice, setAuthUserData, setIsAdmin, setIsLoggedIn, setOrganization } from "../../../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/storeHooks";

const validationSchema = Yup.object({
    name: Yup.string().required('* Required'),
    addressLine1: Yup.string().required('* Required'),
    addressLine2: Yup.string().required('* Required'),
    city: Yup.string().required('* Required'),
    state: Yup.string().required('* Required'),
    country: Yup.string().required('* Required'),
    pinCode: Yup.string().required('* Required'),
    phoneNo: Yup.string().matches(/^\d{10}$/, 'Invalid Mobile Number').required("* Required"),
    gst: Yup.string().required('* Required'),
});

const Organization = () => {
    const api = new Api();
    const organizationId = getCookie('organizationId');
    const authSlice = useAppSelector(getAuthSlice);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const defaultOrganizaion: IAddOrganization = {
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
        phoneNo: "",
        gst: "",
    }
    const [orgInfo, setOrgInfo] = useState<any>(defaultOrganizaion);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaveLoader, setIsSaveLoader] = useState<boolean>(false);
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });


    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: orgInfo,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: () => {
            handleConfirm(values);
        }
    });

    const handleConfirm = async (values: any) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                name: values?.name,
                addressLine1: values?.addressLine1,
                addressLine2: values?.addressLine2,
                city: values?.city,
                state: values?.state,
                country: values?.country,
                pinCode: values?.pinCode,
                phoneNo: values?.phoneNo,
                gst: values?.gst,
            }

            const res = await api.put(`/organization`, payload);
            setIsSaveLoader(false);
            if (res?.status === 200) {
                dispatch(setAuthUserData({ ...authSlice?.userData, organizationId: res?.data?.data?._id || null }));
                dispatch(setIsLoggedIn(true));
                setCookie('organizationId', res?.data?.data?._id || null);
                dispatch(setOrganization(res?.data?.data || null));
                dispatch(setIsAdmin(true));
                setTimeout(() => {
                    router.push('/');
                }, 1000);
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Organization Created Successfully' });
            } else {
                setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
            }

        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }


    return (
        <Row>
            <Col sm={12}>
                <div className='loginBg' style={{ backgroundImage: `url(/assets/images/crm.jpg)` }}>
                    {
                        isLoading
                            ? (
                                <div className='fullpageloader'>
                                    <Loader />
                                </div>
                            )
                            : (
                                <Card className="organizationBox border-0">
                                    <Card.Title className="text-center">
                                        <Image height={80} width={150} className="mx-auto" src={Logo} alt="Logo" />
                                    </Card.Title>
                                    <Card.Header className='cardHeader'>
                                        <h4 className="cardHeading">Add Organization</h4>
                                    </Card.Header>
                                    <Card.Body className="">
                                        <Form onSubmit={(e: any) => {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }}>
                                            <Row>
                                                <Col sm={4}>
                                                    <Form.Group className="mb-3" controlId="name">
                                                        <Form.Label className="text-white">Name <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="name"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.name}
                                                            className={`${(errors?.name && touched?.name) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.name && touched?.name) && (
                                                                <span className='invalid-feedback'>{typeof errors?.name == "string" ? errors?.name : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group className="mb-3" controlId="phoneNo">
                                                        <Form.Label className="text-white">Phone No <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="phoneNo"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.phoneNo}
                                                            className={`${(errors?.phoneNo && touched?.phoneNo) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.phoneNo && touched?.phoneNo) && (
                                                                <span className='invalid-feedback'>{typeof errors?.phoneNo == "string" ? errors?.phoneNo : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={4}>
                                                    <Form.Group className="mb-3" controlId="gst">
                                                        <Form.Label className="text-white">Gst <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="gst"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.gst}
                                                            className={`${(errors?.gst && touched?.gst) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.gst && touched?.gst) && (
                                                                <span className='invalid-feedback'>{typeof errors?.gst == "string" ? errors?.gst : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="addressLine1">
                                                        <Form.Label className="text-white">Address Line 1 <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="addressLine1"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.addressLine1}
                                                            className={`${(errors?.addressLine1 && touched?.addressLine1) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.addressLine1 && touched?.addressLine1) && (
                                                                <span className='invalid-feedback'>{typeof errors?.addressLine1 == "string" ? errors?.addressLine1 : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="addressLine2">
                                                        <Form.Label className="text-white">Address Line 2 <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="addressLine2"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.addressLine2}
                                                            className={`${(errors?.addressLine2 && touched?.addressLine2) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.addressLine2 && touched?.addressLine2) && (
                                                                <span className='invalid-feedback'>{typeof errors?.addressLine2 == "string" ? errors?.addressLine2 : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group className="mb-3" controlId="city">
                                                        <Form.Label className="text-white">City <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="city"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.city}
                                                            className={`${(errors?.city && touched?.city) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.city && touched?.city) && (
                                                                <span className='invalid-feedback'>{typeof errors?.city == "string" ? errors?.city : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group className="mb-3" controlId="state">
                                                        <Form.Label className="text-white">State <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="state"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.state}
                                                            className={`${(errors?.state && touched?.state) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.state && touched?.state) && (
                                                                <span className='invalid-feedback'>{typeof errors?.state == "string" ? errors?.state : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group className="mb-3" controlId="country">
                                                        <Form.Label className="text-white">Country <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="country"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.country}
                                                            className={`${(errors?.country && touched?.country) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.country && touched?.country) && (
                                                                <span className='invalid-feedback'>{typeof errors?.country == "string" ? errors?.country : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group className="mb-3" controlId="pinCode">
                                                        <Form.Label className="text-white">Pincode <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="pinCode"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.pinCode}
                                                            className={`${(errors?.pinCode && touched?.pinCode) ? 'is-invalid' : ''}`}
                                                        />
                                                        {
                                                            (errors?.pinCode && touched?.pinCode) && (
                                                                <span className='invalid-feedback'>{typeof errors?.pinCode == "string" ? errors?.pinCode : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>

                                            </Row>
                                            <div className='d-flex justify-content-end'>
                                                {/* <Button onClick={onHide} className='linkBtn me-3'>
                                            Cancel
                                        </Button> */}
                                                <Button type="submit" className='mainBtn'>
                                                    {'Add'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )

                    }
                    {
                        snackbarInfo?.isShow && (
                            <Snackbar open={snackbarInfo.isShow} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={handleCloseSnackbar}>
                                <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.variant as 'success' | 'error' | 'warning' | 'info'} >
                                    {snackbarInfo.message}
                                </Alert>
                            </Snackbar>
                        )
                    }
                    {isSaveLoader && <SaveLoader isShow />}
                </div>
            </Col>
        </Row>
    )
}

export default Organization;