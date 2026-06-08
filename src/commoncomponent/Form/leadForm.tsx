import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Offcanvas, Row, Table } from 'react-bootstrap'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { currencyOptions, leadSourceOptions, LeadStatuses, leadStatusOptions, paymentMethodOptions, productTypeOptions, ProductTypes, UserRoles } from '@/utils/helper/constants';
import Api from '@/utils/helper/api';
import { IInventoryData } from '@/utils/interfaces/inventory';
import { IUserData } from '@/utils/interfaces/user';
import dynamic from 'next/dynamic';
import { IUpdateLead } from '@/utils/interfaces/leads';
import { IUpdatePayment } from '@/utils/interfaces/payment';
import { useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice } from '../../../redux/slices/authSlice';

interface ILeadForm {
    show: boolean,
    modalData: any,
    isEditMode: boolean,
    onHide: () => void;
    handleConfirm: (data: any) => void;
}

const Editor = dynamic(() => import("../Editor/index"), {
    ssr: false,
});

const validationSchema = Yup.object({
    phoneNo: Yup.string().matches(/^\d{10}$/, 'Invalid Mobile Number').required("* Required"),
    selected_status: Yup.object({
        _id: Yup.string(),
        code: Yup.string().nullable(),
    }).nullable(),
    payment_details: Yup.object().when(
        'selected_status',
        (selected_status: any, schema: any) => {
            return (selected_status?.length && selected_status[0]?.code === LeadStatuses.CLOSE)
                ? schema.shape({
                    transaction_date: Yup.string().required('* Required'),
                    due_date: Yup.string().required('* Required'),
                    payment_method: Yup.string().required('* Required'),
                    closing_amount: Yup.number().required('* Required'),
                    amount: Yup.number().required('* Required').max(Yup.ref('closing_amount'), 'Amount cannot be greater than Closing Amount'),
                }).required("* Required")
                : schema.shape({
                    transaction_date: Yup.string().nullable(),
                    due_date: Yup.string().nullable(),
                    payment_method: Yup.string().nullable(),
                    closing_amount: Yup.string().nullable(),
                    amount: Yup.string().nullable(),
                }).nullable()
        }
    ),
    selected_lost_reason: Yup.object().when(
        'selected_status',
        (selected_status: any, schema: any) => {
            return (selected_status?.length && selected_status[0]?.code === LeadStatuses.LOST)
                ? schema.shape({
                    _id: Yup.string().required('* Required'),
                }).required("* Required")
                : schema.shape({
                    _id: Yup.string().nullable(),
                }).nullable()
        }
    ),
});

const LeadForm = ({ show, modalData, isEditMode, onHide, handleConfirm }: ILeadForm) => {

    const defaultPaymentDetails: IUpdatePayment = {
        transaction_date: null,
        due_date: null,
        payment_method: "",
        closing_amount: "",
        amount: "",
        currency: "",
        description: "",
    }

    const defaultLead: IUpdateLead = {
        name: "",
        phoneNo: "",
        email: "",
        amount: "",
        currency: "",
        selected_source: null,
        productType: ProductTypes.Product,
        followUpDate: null,
        description: "",
        serviceId: null,
        ownerId: null,
        selected_status: null,
        closing_amount: '',
        selected_lost_reason: null,
        payment_details: defaultPaymentDetails,
    }

    const api = new Api();
    const authSlice = useAppSelector(getAuthSlice);
    const userData: IUserData | null = authSlice ? authSlice?.userData : null;
    const isAdmin = ((userData?.role === UserRoles.ADMIN) || (userData?.role === UserRoles.SUPER_ADMIN));
    const [leadInfo, setLeadInfo] = useState<IUpdateLead>(defaultLead);
    const [inventoryList, setInventoryList] = useState<IInventoryData[]>([]);
    const [employeeList, setEmployeeList] = useState<IUserData[]>([]);
    const [sourcesList, setSourcesList] = useState<any[]>([]);
    const [reasonList, setReasonList] = useState<any[]>([]);
    const [stageList, setStageList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: leadInfo,
        validationSchema: validationSchema,
        enableReinitialize: true,
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

    const getSourcesData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/sources`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                if (isEditMode && modalData?.source) {
                    const updatedSource = updatedData?.find((item: any) => item?._id === modalData?.source);
                    setFieldValue("selected_source", updatedSource || null)
                }
                setSourcesList(updatedData);
            } else {
                setSourcesList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getLostReasonData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/lost-reason`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                if (isEditMode && modalData?.lost_reason) {
                    const updatedReason = updatedData?.find((item: any) => item?._id === modalData?.lost_reason);
                    setFieldValue("selected_lost_reason", updatedReason || null)
                }
                setReasonList(updatedData);
            } else {
                setReasonList([]);
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
                const newStatus = updatedData?.find((item: any) => item?.code === LeadStatuses.NEW);
                if (isEditMode && modalData?.status) {
                    const updatedStatus = updatedData?.find((item: any) => item?._id === modalData?.status);
                    setFieldValue("selected_status", updatedStatus || newStatus || null)
                } else {
                    setFieldValue("selected_status", newStatus || null)
                }
                setStageList(updatedData);
            } else {
                setStageList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const handleSelection = (value: string, field: string) => {
        if (field === 'productType') {
            setFieldValue('serviceId', '');
            setFieldValue(field, value);
            getInventoryData(value as ProductTypes);
        } else if (field === 'selected_status') {
            const updatedStatus = stageList?.find((item: any) => item?._id === value);
            setFieldValue("selected_status", updatedStatus || null);
            setFieldValue("selected_lost_reason", null);
            setFieldValue('payment_details', (updatedStatus?.code === LeadStatuses.CLOSE ? defaultPaymentDetails : null));
        } else if (field === 'selected_source') {
            const updatedSource = sourcesList?.find((item: any) => item?._id === value);
            setFieldValue("selected_source", updatedSource || null);
        } else if (field === 'selected_lost_reason') {
            const updatedReason = reasonList?.find((item: any) => item?._id === value);
            setFieldValue("selected_lost_reason", updatedReason || null);
        } else {
            setFieldValue(field, value);
        }
    }

    const handleEditorChange = (field: string, editor: any) => {
        const data = editor?.getData();
        setFieldValue(field, data);
    }

    const getDefaultFormValue = () => {
        const updatedData = {
            name: modalData?.name || "",
            phoneNo: modalData?.phoneNo || "",
            email: modalData?.email || "",
            amount: modalData?.amount || "",
            currency: modalData?.currency || "",
            selected_source: null,
            productType: modalData?.productType || ProductTypes.Product,
            followUpDate: modalData?.followUpDate ? moment(modalData?.followUpDate).toDate() : null,
            description: modalData?.description || "",
            serviceId: modalData?.serviceId || null,
            ownerId: modalData?.ownerId || null,
            selected_status: null,
            closing_amount: modalData?.closing_amount || '',
            selected_lost_reason: null,
            payment_details: defaultPaymentDetails,
        };
        setLeadInfo(updatedData);
        getEmployeeData();
        getInventoryData(updatedData?.productType);
        getSourcesData();
        getLostReasonData();
        getContactStagesData();
    }

    useEffect(() => {
        if (isEditMode) {
            getDefaultFormValue();
        } else {
            getInventoryData(values?.productType);
            getEmployeeData();
            getSourcesData();
            getLostReasonData();
            getContactStagesData();
        }
    }, [modalData])


    return (
        <Offcanvas
            style={{ width: '650px', maxWidth: "100%" }} show={show} onHide={onHide} placement='end' >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title className='heading'>{isEditMode ? 'Update Lead' : 'Add New Lead'}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={(e: any) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}>
                    <Row>
                        <Col sm={12}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Lead Name </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    name="name"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values?.name}
                                />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
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
                        <Col sm={6}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    name="email"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values?.email}
                                />
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
                                    value={values?.amount}
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
                                    value={values?.currency}
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
                            <Form.Group className="mb-3" controlId="selected_source">
                                <Form.Label>Source</Form.Label>
                                <Form.Select
                                    name="selected_source"
                                    onChange={(e) => handleSelection(e?.target?.value, "selected_source")}
                                    onBlur={handleBlur}
                                    value={values?.selected_source?._id || ''}
                                >
                                    <option value="" hidden></option>
                                    {
                                        sourcesList.map(item => (
                                            <option key={item?._id} value={item?._id}>{item?.title}</option>
                                        ))
                                    }
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3" controlId="productType">
                                <Form.Label>Product Type</Form.Label>
                                <Form.Select
                                    name="productType"
                                    onChange={(e: any) => handleSelection(e?.target?.value, 'productType')}
                                    onBlur={handleBlur}
                                    value={values?.productType}
                                    key={values?.productType}
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
                                    value={values?.serviceId || ''}
                                    key={values?.serviceId}
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
                        {
                            isAdmin && (
                                <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="ownerId">
                                        <Form.Label>Owner</Form.Label>
                                        <Form.Select
                                            name="ownerId"
                                            onChange={(e: any) => handleSelection(e?.target?.value, 'ownerId')}
                                            onBlur={handleBlur}
                                            value={values?.ownerId || ''}
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
                            )
                        }
                        <Col sm={6}>
                            <Form.Group className="mb-3" controlId="followUpDate">
                                <Form.Label>Follow Up Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    placeholder=""
                                    name="followUpDate"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values?.followUpDate ? moment(values?.followUpDate).format('YYYY-MM-DD') : ''}
                                />
                            </Form.Group>
                        </Col>

                        <Col sm={12}>
                            <Form.Group className="mb-3" controlId="">
                                <Form.Label>Description</Form.Label>
                                <Editor
                                    value={values?.description}
                                    onChange={(event: any, editor: any) => handleEditorChange(`description`, editor)}
                                />
                            </Form.Group>
                        </Col>

                        {
                            isEditMode && (
                                <>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3" controlId="selected_status">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Select
                                                name="selected_status"
                                                onChange={(e: any) => handleSelection(e?.target?.value, 'selected_status')}
                                                onBlur={handleBlur}
                                                value={values?.selected_status?._id || ''}
                                                key={values?.selected_status?._id}
                                            >
                                                <option value="" hidden></option>
                                                {
                                                    (stageList || []).map(item => (
                                                        <option key={item?._id} value={item?._id}>{item?.title}</option>
                                                    ))
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {
                                        (values?.selected_status?.code === LeadStatuses.LOST) && (
                                            <Col sm={6}>
                                                <Form.Group className="mb-3" controlId="selected_lost_reason">
                                                    <Form.Label>Lost Reason <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        name="selected_lost_reason"
                                                        onChange={(e: any) => handleSelection(e?.target?.value, 'selected_lost_reason')}
                                                        onBlur={handleBlur}
                                                        value={values?.selected_lost_reason?._id || ''}
                                                    >
                                                        <option value="" hidden></option>
                                                        {
                                                            reasonList.map(item => (
                                                                <option key={item?._id} value={item?._id}>{item?.title}</option>
                                                            ))
                                                        }
                                                    </Form.Select>
                                                    {
                                                        (errors?.selected_lost_reason && touched?.selected_lost_reason) && (
                                                            <span className='form-error'>{typeof errors?.selected_lost_reason == "string" ? errors?.selected_lost_reason : '* Required'}</span>
                                                        )
                                                    }
                                                </Form.Group>
                                            </Col>
                                        )
                                    }
                                    {
                                        (values?.selected_status?.code === LeadStatuses.CLOSE) && (
                                            <>
                                                <Col sm={12}>
                                                    <div className='subHeading mt-4'>Payment Details</div>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="payment_details.transaction_date">
                                                        <Form.Label>Payment Date <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            placeholder=""
                                                            name="payment_details.transaction_date"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.payment_details?.transaction_date ? moment(values?.payment_details?.transaction_date).format('YYYY-MM-DD') : ''}
                                                        />
                                                        {
                                                            (errors?.payment_details?.transaction_date && touched?.payment_details?.transaction_date) && (
                                                                <span className='form-error'>{typeof errors?.payment_details?.transaction_date == "string" ? errors?.payment_details?.transaction_date : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="payment_details.closing_amount">
                                                        <Form.Label>Closing Amount <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="payment_details.closing_amount"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.payment_details?.closing_amount}
                                                        />
                                                        {
                                                            (errors?.payment_details?.closing_amount && touched?.payment_details?.closing_amount) && (
                                                                <span className='form-error'>{typeof errors?.payment_details?.closing_amount == "string" ? errors?.payment_details?.closing_amount : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="payment_details.due_date">
                                                        <Form.Label>Due Date <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            placeholder=""
                                                            name="payment_details.due_date"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.payment_details?.due_date ? moment(values?.payment_details?.due_date).format('YYYY-MM-DD') : ''}
                                                        />
                                                        {
                                                            (errors?.payment_details?.due_date && touched?.payment_details?.due_date) && (
                                                                <span className='form-error'>{typeof errors?.payment_details?.due_date == "string" ? errors?.payment_details?.due_date : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="payment_details.payment_method">
                                                        <Form.Label>Payment Method <span className="text-danger">*</span></Form.Label>
                                                        <Form.Select
                                                            name="payment_details.payment_method"
                                                            onChange={(e: any) => handleSelection(e?.target?.value, 'payment_details.payment_method')}
                                                            onBlur={handleBlur}
                                                            value={values?.payment_details?.payment_method || ""}
                                                            key={values?.payment_details?.payment_method}
                                                        >
                                                            <option value="" hidden></option>
                                                            {
                                                                paymentMethodOptions.map(item => (
                                                                    <option key={item?.value} value={item?.value}>{item?.label}</option>
                                                                ))
                                                            }
                                                        </Form.Select>
                                                        {
                                                            (errors?.payment_details?.payment_method && touched?.payment_details?.payment_method) && (
                                                                <span className='form-error'>{typeof errors?.payment_details?.payment_method == "string" ? errors?.payment_details?.payment_method : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={6}>
                                                    <Form.Group className="mb-3" controlId="payment_details.amount">
                                                        <Form.Label>Payment Amount <span className="text-danger">*</span></Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder=""
                                                            name="payment_details.amount"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            value={values?.payment_details?.amount}
                                                        />
                                                        {
                                                            (errors?.payment_details?.amount && touched?.payment_details?.amount) && (
                                                                <span className='form-error'>{typeof errors?.payment_details?.amount == "string" ? errors?.payment_details?.amount : '* Required'}</span>
                                                            )
                                                        }
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        )
                                    }
                                </>
                            )
                        }

                    </Row>
                    <div className='d-flex justify-content-end'>
                        <Button onClick={onHide} className='linkBtn me-3'>
                            Cancel
                        </Button>
                        <Button type="submit" className='mainBtn'>
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Offcanvas.Body>
        </Offcanvas>
    )
}

export default LeadForm;