import React, { Suspense, useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import Input from '@/commoncomponent/Input';
import Select from '@/commoncomponent/Select';
import { PrimaryButton } from '@/commoncomponent/Button';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import Api from '@/utils/helper/api';
import { ISnackbar } from '@/utils/interfaces/common';
import { AddInventoryData } from '@/utils/interfaces/inventory';
import { FormikProps, useFormik } from 'formik';
import Loader from '@/commoncomponent/Loader';
import { Alert, Snackbar } from '@mui/material';
import { productTypeOptions } from '@/utils/helper/constants';

const validationSchema = Yup.object({
    name: Yup.string().required("Please enter name"),
    productType: Yup.string().required("Please Select Product Type"),
    price: Yup.string().required("Please enter price"),
    tax: Yup.string().required("Please enter tax"),
    sku: Yup.string().required("Please enter SKU"),
});

export default function AddInventory() {

    return (
        <Suspense fallback={<Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}>
            <AddInventoryForm />
        </Suspense>
    );
}


function AddInventoryForm() {

    const defaultInventory = {
        name: "",
        productType: productTypeOptions[0].value,
        price: "",
        tax: "",
        sku: "",
        isEdit: false,
    }

    const router = useRouter();
    const inventoryId = router.query?.inventoryId;
    const isEditPage = inventoryId && inventoryId !== 'create';
    const api = new Api();
    const [isSaveLoader, setIsSaveLoader] = useState<boolean>(false);
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });
    const [isLoading, setIsLoading] = useState(isEditPage ? true : false);

    const onSubmitData = async () => {
        try {
            setIsSaveLoader(true);
            const payload = {
                name: values?.name,
                productType: values?.productType,
                price: values?.price,
                tax: values?.tax,
                sku: values?.sku,
            }
            if (values?.isEdit) {
                const res = await api.post(`/inventory/${inventoryId}`, payload);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Inventory Updated Successfully' });
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            } else {
                const res = await api.put(`/inventory`, payload);
                setIsSaveLoader(false);
                if (res?.status == 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Inventory Added Successfully' });
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
                }
            }
            router.push(`/inventory`);
        } catch (error: any) {
            setIsLoading(false)
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }


    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue, resetForm }: FormikProps<AddInventoryData> = useFormik<AddInventoryData>({
        initialValues: defaultInventory,
        validationSchema: validationSchema,
        onSubmit: () => {
            onSubmitData();
        },
    });

    const onFormKeyPress = (keyEvent: any) => {
        if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
            keyEvent.preventDefault();
        }
    }

    useEffect(() => {
        if (inventoryId && inventoryId !== 'create') {
            getInventoryById();
            setValues({ ...values, isEdit: true });
        }
    }, [inventoryId])

    const getInventoryById = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/inventory/${inventoryId}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setValues({
                    _id: updatedData?._id,
                    name: updatedData?.name || "",
                    productType: updatedData?.productType || "",
                    price: updatedData?.price || "",
                    tax: updatedData?.tax || "",
                    sku: updatedData?.sku || "",
                    isEdit: true
                });
            } else {
                setValues({ ...defaultInventory });
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }


    return (
        <Container>
            <div className='main px-0'>
                <Breadcrumb className='mb-3'>
                    <Breadcrumb.Item href="#" >Home / Inventory / Add Inventory</Breadcrumb.Item>
                </Breadcrumb>
                {isLoading ? (
                    <div className='fullpageloader'>
                        <Loader />
                    </div>
                )
                    :

                    <Card>
                        <Card.Header className='cardHeader'>
                            <h4 className='cardTitle'>{isEditPage ? 'Update Inventory' : 'Add Inventory'}</h4>
                        </Card.Header>
                        <Card.Body>
                            <form onKeyDown={onFormKeyPress} onSubmit={handleSubmit}>
                                <Row>
                                    <Col xl={4} sm={6} className='mb-3'>
                                        <Input label="Product Name" name="name" value={values?.name} onChange={handleChange} onBlur={handleBlur} />
                                        {
                                            (errors?.name && touched?.name) && (
                                                <p className='form-error'>{errors?.name}</p>
                                            )
                                        }
                                    </Col>
                                    <Col xl={4} sm={6} className='mb-3'>
                                        <Select label="Product Type" name="productType" value={values?.productType} onChange={handleChange} onBlur={handleBlur} options={productTypeOptions} />
                                        {
                                            (errors?.productType && touched?.productType) && (
                                                <p className='form-error'>{errors?.productType}</p>
                                            )
                                        }
                                    </Col>
                                    <Col xl={4} sm={6} className='mb-3'>
                                        <Input label="Price" name="price" value={values?.price} onChange={handleChange} onBlur={handleBlur} />
                                        {
                                            (errors?.price && touched?.price) && (
                                                <p className='form-error'>{errors?.price}</p>
                                            )
                                        }

                                    </Col>
                                    <Col xl={4} sm={6} className='mb-3'>
                                        <Input label={`Tax (%)`} name="tax" value={values?.tax} onChange={handleChange} onBlur={handleBlur} />
                                        {
                                            (errors?.tax && touched?.tax) && (
                                                <p className='form-error'>{errors?.tax}</p>
                                            )
                                        }
                                    </Col>

                                    <Col xl={4} sm={6} className='mb-3'>
                                        <Input label="SKU" name="sku" value={values?.sku} onChange={handleChange} onBlur={handleBlur} />
                                        {
                                            (errors?.sku && touched?.sku) && (
                                                <p className='form-error'>{errors?.sku}</p>
                                            )
                                        }
                                    </Col>
                                </Row>
                                <div className='text-center'>
                                    {isSaveLoader ?
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className='me-1'
                                            />
                                            Loading...
                                        </>
                                        :
                                        <PrimaryButton onClick={() => { }} label={values?.isEdit ? "Update" : "Add"} isDisabled={isSaveLoader} type='submit' />
                                    }
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
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
            </div>
        </Container>
    )
}
