import { IUpdateOrganization } from "@/utils/interfaces/organization";
import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CardComponent from "@/commoncomponent/Card";
import Loader from "@/commoncomponent/Loader";
import Api from "@/utils/helper/api";
import { getCookie } from "cookies-next";
import { ISnackbar } from "@/utils/interfaces/common";
import { Alert, Snackbar } from "@mui/material";
import SaveLoader from "@/commoncomponent/Loader/saveLoader";

const validationSchema = Yup.object({
    addressLine1: Yup.string().required('* Required'),
    addressLine2: Yup.string().required('* Required'),
    city: Yup.string().required('* Required'),
    state: Yup.string().required('* Required'),
    country: Yup.string().required('* Required'),
    pinCode: Yup.string().required('* Required'),
    phoneNo: Yup.string().matches(/^\d{10}$/, 'Invalid Mobile Number').required("* Required"),
    gst: Yup.string().required('* Required'),
});

const OrganizationSetting = () => {
    const api = new Api();
    const organizationId = getCookie('organizationId');
    const defaultOrganizaion: IUpdateOrganization = {
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
                addressLine1: values?.addressLine1,
                addressLine2: values?.addressLine2,
                city: values?.city,
                state: values?.state,
                country: values?.country,
                pinCode: values?.pinCode,
                phoneNo: values?.phoneNo,
                gst: values?.gst,
            }

            const res = await api.post(`/organization/${organizationId}`, payload);
            setIsSaveLoader(false);
            if (res?.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Organization Updated Successfully' });
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

    const getOrganizationDetail = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/organization/detail`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setOrgInfo(updatedData || {});
            } else {
                setOrgInfo({});
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getOrganizationDetail();
    }, [])

    return (
        <Container>
            <div className='main'>
                {
                    isLoading
                        ? (
                            <div className='fullpageloader'>
                                <Loader />
                            </div>
                        )
                        : (
                            <Card className="border-0">
                                <Card.Header className='cardHeader'>
                                    <h4 className="">Organization Setting</h4>
                                </Card.Header>
                                <Card.Body className="">
                                    <Form onSubmit={(e: any) => {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }}>
                                        <Row>
                                            <Col sm={4}>
                                                <Form.Group className="mb-3" controlId="name">
                                                    <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="name"
                                                        value={orgInfo?.name}
                                                        disabled
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={4}>
                                                <Form.Group className="mb-3" controlId="phoneNo">
                                                    <Form.Label>Phone No <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="phoneNo"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.phoneNo}
                                                    />
                                                    {
                                                        (errors?.phoneNo && touched?.phoneNo) && (
                                                            <span className='form-error'>{typeof errors?.phoneNo == "string" ? errors?.phoneNo : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={4}>
                                                <Form.Group className="mb-3" controlId="gst">
                                                    <Form.Label>Gst <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="gst"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.gst}
                                                    />
                                                    {
                                                        (errors?.gst && touched?.gst) && (
                                                            <span className='form-error'>{typeof errors?.gst == "string" ? errors?.gst : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group className="mb-3" controlId="addressLine1">
                                                    <Form.Label>Address Line 1 <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="addressLine1"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.addressLine1}
                                                    />
                                                    {
                                                        (errors?.addressLine1 && touched?.addressLine1) && (
                                                            <span className='form-error'>{typeof errors?.addressLine1 == "string" ? errors?.addressLine1 : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={6}>
                                                <Form.Group className="mb-3" controlId="addressLine2">
                                                    <Form.Label>Address Line 2 <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="addressLine2"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.addressLine2}
                                                    />
                                                    {
                                                        (errors?.addressLine2 && touched?.addressLine2) && (
                                                            <span className='form-error'>{typeof errors?.addressLine2 == "string" ? errors?.addressLine2 : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={3}>
                                                <Form.Group className="mb-3" controlId="city">
                                                    <Form.Label>City <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="city"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.city}
                                                    />
                                                    {
                                                        (errors?.city && touched?.city) && (
                                                            <span className='form-error'>{typeof errors?.city == "string" ? errors?.city : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={3}>
                                                <Form.Group className="mb-3" controlId="state">
                                                    <Form.Label>State <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="state"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.state}
                                                    />
                                                    {
                                                        (errors?.state && touched?.state) && (
                                                            <span className='form-error'>{typeof errors?.state == "string" ? errors?.state : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={3}>
                                                <Form.Group className="mb-3" controlId="country">
                                                    <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="country"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.country}
                                                    />
                                                    {
                                                        (errors?.country && touched?.country) && (
                                                            <span className='form-error'>{typeof errors?.country == "string" ? errors?.country : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col sm={3}>
                                                <Form.Group className="mb-3" controlId="pinCode">
                                                    <Form.Label>Pincode <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=""
                                                        name="pinCode"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values?.pinCode}
                                                    />
                                                    {
                                                        (errors?.pinCode && touched?.pinCode) && (
                                                            <span className='form-error'>{typeof errors?.pinCode == "string" ? errors?.pinCode : '* Required'}</span>
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
                                                {'Update'}
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
        </Container>
    )
}

export default OrganizationSetting;