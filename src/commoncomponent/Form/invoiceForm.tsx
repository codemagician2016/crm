import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Offcanvas, Row, Table } from 'react-bootstrap'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import Select from 'react-select';
import { currencyOptions, leadSourceOptions, LeadStatuses, leadStatusOptions, paymentMethodOptions, productTypeOptions, ProductTypes } from '@/utils/helper/constants';
import Api from '@/utils/helper/api';
import { IInventoryData } from '@/utils/interfaces/inventory';
import { IUserData } from '@/utils/interfaces/user';
import dynamic from 'next/dynamic';
import { customSelectStyles } from '@/utils/helper/index';
import SaveLoader from '../Loader/saveLoader';

interface IInvoiceForm {
    show: boolean,
    modalData: any,
    onHide: () => void;
    handleConfirm: (data: any) => void;
}

const Editor = dynamic(() => import("../Editor/index"), {
    ssr: false,
});

const validationSchema = Yup.object({
    selected_lead: Yup.object({
        _id: Yup.string().required("* Required"),
    }).required("* Required"),
    transaction_date: Yup.string().required('* Required'),
    due_date: Yup.string().required('* Required'),
    payment_method: Yup.string().required('* Required'),
    pending_amount: Yup.number(),
    amount: Yup.number().required('* Required').max(Yup.ref('pending_amount'), 'Amount cannot be greater than Pending Amount'),
});

const InvoiceForm = ({ show, modalData, onHide, handleConfirm }: IInvoiceForm) => {


    const defaultInvoice: any = {
        selected_lead: null,
        transaction_date: null,
        due_date: null,
        payment_method: "",
        closing_amount: "",
        pending_amount: "",
        amount: "",
        currency: "",
        description: "",
    }

    const api = new Api();
    const [inventoryList, setInventoryList] = useState<IInventoryData[]>([]);
    const [employeeList, setEmployeeList] = useState<IUserData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLeadLoading, setIsLeadLoading] = useState<boolean>(false);
    const [leadOptions, setLeadOptions] = useState<any>([]);
    const [closedStage, setClosedStage] = useState<any>(null);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: defaultInvoice,
        validationSchema: validationSchema,
        onSubmit: () => {
            handleConfirm(values);
        }
    });

    const getInventoryData = async (type: ProductTypes) => {
        try {
            setIsLoading(true);
            let url = '/inventory';
            if (type) {
                url += `?productType=${type}`;
            }

            const res = await api.get(url);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setInventoryList(updatedData || []);
            } else {
                setInventoryList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getEmployeeData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/user`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setEmployeeList(updatedData || []);
            } else {
                setEmployeeList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getContactStagesData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/contact-stages`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                const closeStatus = updatedData?.find((item: any) => item?.code === LeadStatuses.CLOSE);
                
                setClosedStage(closeStatus);
            } else {
                setClosedStage(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const handleSelection = (value: string, field: string) => {
        setFieldValue(field, value);
        if (field === 'productType') {
            setFieldValue('serviceId', '');
            getInventoryData(value as ProductTypes);
        }
    }

    const getLeadList = async (search: string) => {
        try {
            setIsLeadLoading(true);
            const params = {
                sort_field: 'createdAt',
                sort_order: 'desc',
                stage: 'All',
                statuses: closedStage?._id,
                name: search || '',
            }
            const res = await api.get(`/lead`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data?.leadsList || [];
                setLeadOptions(updatedData || []);
            } else {
                setLeadOptions([]);
            }
            setIsLeadLoading(false);
        } catch (error: any) {
            setIsLeadLoading(false)
        }
    }

    const handleLeadSelection = async (value: any) => {
        try {
            if (value) {
                setIsLoading(true);
                const res = await api.get(`/lead/${value?._id}`);
                if (res?.status == 200) {
                    const updatedData = res?.data?.data?.length ? res?.data?.data[0] : null;
                    const pending_amount = Number(updatedData?.payment_details?.closing_amount || 0) - Number(updatedData?.invoiceDetail?.totalAmount || 0)
                    setFieldValue('selected_lead', updatedData || null);
                    setFieldValue('pending_amount', pending_amount || "");
                    setFieldValue('amount', pending_amount || "");
                    getInventoryData(updatedData?.productType);
                    getEmployeeData();
                } else {
                    setFieldValue('selected_lead', null)
                    setFieldValue('pending_amount', "")
                }
                setIsLoading(false);
            } else {
                setFieldValue('selected_lead', null)
                setFieldValue('pending_amount', "")
            }
        } catch (error: any) {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        getContactStagesData();
    }, [])

    return (
        <>
            <Offcanvas
                style={{ width: '650px', maxWidth: "100%" }} show={show} onHide={onHide} placement='end' >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className='heading'>{'Add New Invoice'}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={(e: any) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}>
                        <Row>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label>Lead Phone </Form.Label>
                                    <Select
                                        className="cstm-search-select-container"
                                        classNamePrefix="cstm-search-select"
                                        options={leadOptions || []}
                                        getOptionLabel={(option: any) => option?.phoneNo || 'NA'}
                                        getOptionValue={(option: any) => option?._id}
                                        styles={customSelectStyles}
                                        onChange={(newValue: any) => handleLeadSelection(newValue)}
                                        onInputChange={(newValue: any, actionMeta: any) => {
                                            if (actionMeta.action === 'input-change') {
                                                getLeadList(newValue);
                                            }
                                        }}
                                        value={values?.selected_lead || null}
                                        isLoading={isLeadLoading || false}
                                        placeholder={``}
                                        isClearable
                                        menuShouldScrollIntoView={false}
                                        menuPosition="fixed"
                                    />
                                    {
                                        (errors?.selected_lead && touched?.selected_lead) && (
                                            <span className='form-error'>{typeof errors?.selected_lead == "string" ? errors?.selected_lead : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label>Lead Name </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="name"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.name || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            {/* <Col sm={6}>
                                <Form.Group className="mb-3" controlId="phoneNo">
                                    <Form.Label>Phone No </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="phoneNo"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.phoneNo || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col> */}
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label>Email Id</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="email"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.email || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="productType">
                                    <Form.Label>Product Type</Form.Label>
                                    <Form.Select
                                        name="productType"
                                        onChange={(e: any) => handleSelection(e?.target?.value, 'productType')}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.productType || ""}
                                        disabled
                                    >
                                        <option value="" hidden></option>
                                        {
                                            productTypeOptions.map(item => (
                                                <option key={item?.value} value={item?.value}>{item?.label}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="serviceId">
                                    <Form.Label>Product / Service Name</Form.Label>
                                    <Form.Select
                                        name="serviceId"
                                        onChange={(e: any) => handleSelection(e?.target?.value, 'serviceId')}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.serviceId || ""}
                                        disabled
                                    >
                                        <option value="" hidden></option>
                                        {
                                            inventoryList.map(item => (
                                                <option key={item?._id} value={item?._id}>{item?.name}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="amount"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.amount || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="currency">
                                    <Form.Label>Currency</Form.Label>
                                    <Form.Select
                                        name="currency"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.currency || ""}
                                        disabled
                                    >
                                        <option value="" hidden></option>
                                        {
                                            currencyOptions.map(item => (
                                                <option key={item?.value} value={item?.value}>{item?.label}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="ownerId">
                                    <Form.Label>Owner</Form.Label>
                                    <Form.Select
                                        name="ownerId"
                                        onChange={(e: any) => handleSelection(e?.target?.value, 'ownerId')}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.ownerId || ""}
                                        disabled
                                    >
                                        <option value="" hidden></option>
                                        {
                                            employeeList.map(item => (
                                                <option key={item?._id} value={item?._id}>{item?.name}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* <Col sm={12}>
                            <Form.Group className="mb-3" controlId="">
                                <Form.Label>Description</Form.Label>
                                <Editor
                                    value={values?.description}
                                    onChange={(event: any, editor: any) => handleEditorChange(`description`, editor)}
                                />
                            </Form.Group>
                        </Col> */}
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="payment_details.closing_amount">
                                    <Form.Label>Closing Amount</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="payment_details.closing_amount"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.payment_details?.closing_amount || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="payment_details.paid_amount">
                                    <Form.Label>Paid Amount</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="payment_details.paid_amount"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.selected_lead?.invoiceDetail?.totalAmount || ""}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="transaction_date">
                                    <Form.Label>Payment Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        placeholder=""
                                        name="transaction_date"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.transaction_date}
                                    />
                                    {
                                        (errors?.transaction_date && touched?.transaction_date) && (
                                            <span className='form-error'>{typeof errors?.transaction_date == "string" ? errors?.transaction_date : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="due_date">
                                    <Form.Label>Due Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        placeholder=""
                                        name="due_date"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.due_date}
                                    />
                                    {
                                        (errors?.due_date && touched?.due_date) && (
                                            <span className='form-error'>{typeof errors?.due_date == "string" ? errors?.due_date : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="payment_method">
                                    <Form.Label>Payment Method <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="payment_method"
                                        onChange={(e: any) => handleSelection(e?.target?.value, 'payment_method')}
                                        onBlur={handleBlur}
                                        value={values?.payment_method || ""}
                                        key={values?.payment_method}
                                    >
                                        <option value="" hidden></option>
                                        {
                                            paymentMethodOptions.map(item => (
                                                <option key={item?.value} value={item?.value}>{item?.label}</option>
                                            ))
                                        }
                                    </Form.Select>
                                    {
                                        (errors?.payment_method && touched?.payment_method) && (
                                            <span className='form-error'>{typeof errors?.payment_method == "string" ? errors?.payment_method : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="amount">
                                    <Form.Label>Payment Amount <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder=""
                                        name="amount"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values?.amount}
                                    />
                                    {
                                        (errors?.amount && touched?.amount) && (
                                            <span className='form-error'>{typeof errors?.amount == "string" ? errors?.amount : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>


                        </Row>
                        <div className='d-flex justify-content-end'>
                            <Button onClick={onHide} className='linkBtn me-3'>
                                Cancel
                            </Button>
                            <Button type="submit" className='mainBtn'>
                                {'Create'}
                            </Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            {isLoading && <SaveLoader isShow />}
        </>
    )
}

export default InvoiceForm;