import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Button, Card, Container, Row, Col, Form, Offcanvas, Dropdown, CardBody, Spinner, Breadcrumb } from 'react-bootstrap';
import * as Yup from 'yup';
import Api from '@/utils/helper/api';
import { ISnackbar } from '@/utils/interfaces/common';
import Loader from '@/commoncomponent/Loader';
import { FormikProps, useFormik } from 'formik';
import { useRouter } from 'next/router';
import { AddLead } from '@/utils/interfaces/leads';
import { Snackbar, Alert, TextField, InputAdornment, MenuItem, InputLabel, FormControl, TextareaAutosize } from '@mui/material';
import { IUserData } from '@/utils/interfaces/user';
import { FaAngleDown, FaCalendarAlt } from 'react-icons/fa';
import { RxActivityLog } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSearchParams } from 'next/navigation';
import { CgAddR } from 'react-icons/cg';
import { ILog } from '@/utils/interfaces/logs';
import CardComponent from '@/commoncomponent/Card';
import Input from '@/commoncomponent/Input';
import Select from '@/commoncomponent/Select';
import TextArea from '@/commoncomponent/textarea';
import { ISourcesData } from '@/utils/interfaces/sources';
import { TbSortAscending2Filled } from 'react-icons/tb';
import LeadForm from '@/commoncomponent/Form/leadForm';
import { ILeadFilter, IUpdateLead } from '@/utils/interfaces/leads';
import { leadSortOptions, LeadStatuses, leadStatusOptions } from '@/utils/helper/constants';
import moment from 'moment';

const validationSchema = Yup.object({
    name: Yup.string().required("Please enter name"),
    businessName: Yup.string().required("Please enter business name"),
    email: Yup.string().email().required("Please enter your email"),
    phoneNo: Yup.string().required("Please enter your Phone No."),
    source: Yup.string().required("Please enter source"),
    service: Yup.string().required("Please select service"),
    stage: Yup.string().required("Please select stage"),
    assignToId: Yup.string().required("Please select assign to"),
    followUpDate: Yup.string().required("Please select follow up date and time"),
});


export default function AddLeads() {

    return (
        <Suspense fallback={<Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}>
            <AddLeadsForm />
        </Suspense>
    );
}

function AddLeadsForm() {
    const defaultLead = {
        name: "",
        businessName: "",
        phoneNo: "",
        email: "",
        source: "",
        service: "",
        stage:"",
        followUpDate: null,
        comment: "",
        assignToId: "",
        isEdit: false,
    }

    const [show, setShow] = useState(false);
    const [editorData, setEditorData] = useState('<p>Hello from CKEditor 5 in React!</p>');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const router = useRouter();
    const leadId = router.query?.leadId;
    const api = new Api();
    const [isSaveLoader, setIsSaveLoader] = useState<boolean>(false);
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [assignes, setAssignes] = useState<ISelectOption[]>([]);
    const [services, setServices] = useState<ISelectOption[]>([]);
    const [initialValues, setInitialValues] = useState({});
    const searchParams = useSearchParams();
    const stage = searchParams.get("stage");
    const [sources, setSources] = useState<ISourcesData[]>([]);
    const [addLeadModal, setAddLeadModal] = React.useState<any>({ isShow: false, modalData: null, isEditMode: false });
    const [leadData, setLeadData] = useState<any>([]);
    const [logs, setLogs] = useState([]);


    const onSubmitData = async () => {
        try {
            setIsSaveLoader(true);
            const payload = {
                name: values?.name,
                businessName: values?.businessName,
                phoneNo: values?.phoneNo,
                email: values?.email,
                source: values?.source,
                service: values?.service,
                stage: values?.stage,
                followUpDate: values?.followUpDate,
                comment: values?.comment || '',
                assignToId: values?.assignToId,
            }
            if (values?.isEdit) {
                const updatedFields = getUpdatedFields(values, initialValues);
                const res = await api.post(`/lead/${leadId}`, updatedFields);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lead Updated Successfully' });
                    setValues({
                        ...defaultLead,
                    });
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            } 
        } catch (error: any) {
            setIsLoading(false)
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const getUpdatedFields = (values: any, initialValues: any) => {
        return Object.keys(values).reduce((updatedFields: any, key) => {
            if (key !== "isEdit" && key !== "_id" && values[key] !== initialValues[key]) {
                updatedFields[key] = values[key];
            }
            return updatedFields;
        }, {});
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue, resetForm }: FormikProps<AddLead> = useFormik<AddLead>({
        initialValues: defaultLead,
        validationSchema: validationSchema,
        onSubmit: () => {
            onSubmitData();
        },
    })
    const onFormKeyPress = (keyEvent: any) => {
        if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
            keyEvent.preventDefault();
        }
    }

    useEffect(() => {
        if (leadId && leadId !== 'create') {
            getLeadById();
            getLogsByLeadId();
            setValues({ ...values, isEdit: true });
        }
    }, [leadId])

    const getLeadById = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/lead/${leadId}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data?.[0];
                setLeadData(updatedData);


                setValues({
                    _id: updatedData?._id,
                    name: updatedData?.name || "",
                    businessName: updatedData?.businessName || "",
                    phoneNo: updatedData?.phoneNo || "",
                    email: updatedData?.email || "",
                    source: updatedData?.source || "",
                    service: updatedData?.service || "",
                    stage: updatedData?.stage || "",
                    followUpDate: updatedData?.followUpDate ? new Date(updatedData?.followUpDate) : null,
                    comment: updatedData?.comment || "",
                    assignToId: updatedData?.assignToId || "",
                    isEdit: true
                });
                setInitialValues({
                    name: updatedData?.name || "",
                    businessName: updatedData?.businessName || "",
                    phoneNo: updatedData?.phoneNo || "",
                    email: updatedData?.email || "",
                    source: updatedData?.source || "",
                    service: updatedData?.service || "",
                    stage: updatedData?.stage || "",
                    followUpDate: updatedData?.followUpDate ? new Date(updatedData?.followUpDate) : null,
                    comment: updatedData?.comment || "",
                    assignToId: updatedData?.assignToId || ""
                });
            } else {
                setValues({ ...defaultLead });
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

    const getAssigneeData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/user`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setAssignes((updatedData || []).map((val: IUserData) => (
                    {
                        label: val?.name,
                        value: val?._id
                    }
                )));
            } else {
                setAssignes([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
        }
    }

    const getServicesData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/inventory`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setServices((updatedData || []).map((val: IUserData) => (
                    {
                        label: val?.name,
                        value: val?._id
                    }
                )));
            } else {
                setServices([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
        }
    }

    const getSourceData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/dropdown?type=source`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data?.options;
                setSources((updatedData || []).map((val: ISourcesData) => (
                    {
                        label: val?.label,
                        value: val?.value
                    }
                )));
            } else {
                setSources([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAssigneeData();
        getServicesData();
        getSourceData();
    }, []);

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFieldValue('followUpDate', date);
        }
    };

    const getLogsByLeadId = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/logs/${leadId}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setLogs(res.data.data);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }
    const showLeadModal = (data: any, isEdit: boolean) => {
        setAddLeadModal({ isShow: true, modalData: data, isEditMode: isEdit });
    };
    const hideLeadModal = () => {
        setAddLeadModal({ isShow: false, modalData: null, isEditMode: false });
    };

    const getLeadsData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/lead/${addLeadModal?.modalData?._id}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setLeadData(updatedData);
                setValues(updatedData);
            } else {
                setLeadData([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }
    const handleLeadConfirm = async (values: IUpdateLead) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                name: values?.name,
                phoneNo: values?.phoneNo,
                email: values?.email,
                amount: values?.amount,
                currency: values?.currency,
                source: values?.selected_source?._id,
                productType: values?.productType,
                description: values?.description,
                followUpDate: values?.followUpDate,
                serviceId: values?.serviceId,
                ownerId: values?.ownerId,
                status: values?.selected_status?._id,
            }
            if (addLeadModal?.isEditMode) {
                if (values?.selected_status?._id !== addLeadModal?.modalData?.status && values?.selected_status?.code === LeadStatuses.CLOSE) {
                    payload.payment_details = {
                        leadId: addLeadModal?.modalData?._id,
                        payment_method: values?.payment_details?.payment_method,
                        amount: Number(values?.payment_details?.amount),
                        closing_amount: Number(values?.payment_details?.closing_amount),
                        transaction_date: values?.payment_details?.transaction_date,
                        due_date: values?.payment_details?.due_date,
                        description: "",
                        currency: values?.currency,
                    }
                }
                if (values?.selected_status?.code === LeadStatuses.LOST) {
                    payload.lost_reason = values?.selected_lost_reason?._id || null;
                }
                const res = await api.post(`/lead/${addLeadModal?.modalData?._id}`, payload);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lead Updated Successfully' });
                    hideLeadModal();
                    getLeadsData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const groupedLogs: Record<string, ILog[]> = logs.reduce((acc: Record<string, ILog[]>, log: ILog) => {
        const date = new Date(log.createdAt).toDateString(); 
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    const formatValue = (value: any) => {
        if (!value) return 'N/A';
        const date = moment(value);
        if (date.isValid() && value.includes('T')) {
            return date.format('DD MMM YYYY');
        }

        return value;
    };


    return (
        <Container>
            <div className='main'>
                <Card className='mt-5'>
                    <Card.Body>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='d-flex align-items-center justify-content-between'>
                                <div className='box'>
                                    {values?.name?.split(" ")?.map((n: string) => n[0]).join("").toUpperCase() || '--'}
                                </div>
                                <h2 className='leadName'>
                                    {values?.name || "Lead Name"}
                                </h2>
                            </div>
                            <Button onClick={() => showLeadModal(values, true)} className='addBtn'>
                                <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Update Lead</div>
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
                <Row>
                    <Col sm={3}>
                        <Card className='mt-3'>
                            <Card.Body>
                                <h2 className='heading'>Lead Information
                                </h2>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Date Created</p>
                                    <p className='text'>
                                        {leadData?.createdAt ? moment(leadData.createdAt).format('DD MMM YYYY') : '--'}

                                    </p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Value</p>
                                    <p className='text'> {leadData?.amount
                                        ? `$${leadData.amount.toLocaleString()}`
                                        : '--'}</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Due Date</p>
                                    <p className='text'>   {leadData?.payment_details?.due_date
                                        ? new Date(leadData.payment_details.due_date).toLocaleString()
                                        : '--'}</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Follow Up</p>
                                    <p className='text'>  {leadData?.followUpDate
                                        ? new Date(leadData.followUpDate).toLocaleDateString()
                                        : '--'}</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Source</p>
                                    <p className='text'>{leadData?.source_details?.title || '--'}</p>
                                </div>
                                <h2 className='heading mt-3'> Owner</h2>
                                <div className='d-flex align-items-center mt-3'>
                                    <div className='leadOwner'>        {leadData?.name?.split(" ")?.map((n: string) => n[0]).join("").toUpperCase() || '--'}
                                    </div>
                                    <p className='text ms-3'>{leadData?.name || '--'}</p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Last Modified</p>
                                    <p className='text'>  {leadData?.updatedAt
                                        ? new Date(leadData.updatedAt).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })
                                        : "--"}
                                    </p>
                                </div>
                                <div className='d-flex justify-content-between mt-3'>
                                    <p className='text'>Modified By</p>
                                    <p className='text'>Darlee Robertson</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={9}>
                        <Card className='mt-3'>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <h2 className='heading'>Follow up Activities</h2>
                                <div className='d-flex align-items-center'>

                                    <Dropdown className='sort'>
                                        <Dropdown.Toggle className='filter me-3' id="dropdown-basic">
                                            <div><TbSortAscending2Filled style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                            <div>Sort By Date</div>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">Sort By Date</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">Ascending</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">Descending</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Card.Header>
                            {Object.entries(groupedLogs).map(([date, logs]) => (
                                <Card.Body>
                                    <div key={date}>
                                        <p className='activityDate'>
                                            <span><FaCalendarAlt /></span> {moment(date).format('DD MMM YYYY')}
                                        </p>

                                        {logs
                                            .filter(log => {
                                                if (log.type === 'new') return true;
                                                if (log.previousValue === log.newValue) return false;
                                                const isInvalid = (v: any) => v === null || v === '' || v === undefined;
                                                return !(isInvalid(log.previousValue) && isInvalid(log.newValue));
                                            })
                                            .map((log) => (

                                                <Card className='mb-3' key={log._id}>
                                                    <Card.Body>
                                                        <div className='activityBox'>
                                                            <div className='activityIconBox'>
                                                                <RxActivityLog />
                                                            </div>
                                                            <div className='w-76'>
                                                                {log.type === 'new' ? (
                                                                    <p className='dis mb-1'><strong>{log.createdBy}</strong> has created the lead.</p>
                                                                ) : (
                                                                    <p className='dis mb-1'>
                                                                        <strong>{log.createdBy}</strong> updated <strong>{log.field}</strong> from <em>{formatValue(log.previousValue)}</em> to <em>{formatValue(log.newValue)}</em>.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                    </div>
                                </Card.Body>
                            )
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
            <Offcanvas
                style={{ width: '650px', maxWidth: "100%" }} show={show} onHide={handleClose} placement='end' >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className='heading'>Add Activity</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Row>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Activity Type</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option></option>
                                        <option value="1">Phone Call</option>
                                        <option value="2">Meeting</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Next Follow Up</Form.Label>
                                    <Form.Control type="date" placeholder="" />
                                </Form.Group>
                            </Col>

                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option value="1">New</option>
                                        <option value="2">Not Connected</option>
                                        <option value="3">Open</option>
                                        <option value="4">Close</option>
                                        <option value="5">Lost</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="text" placeholder="" />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Lost Reason</Form.Label>
                                    <Form.Select aria-label="Default select example">
                                        <option value="1">Client went silent</option>
                                        <option value="2">Don't have the budget	</option>
                                        <option value="3">Doesn't pick up the phone, doesn't respond</option>
                                        <option value="4">Lack of expertise	</option>
                                        <option value="5">They couldn't afford our services	</option>
                                        <option value="5">Went with our competitor	</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col sm={12}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" as='textarea' rows={4} placeholder="" />
                                </Form.Group>
                            </Col>

                        </Row>
                        <div className='d-flex justify-content-end'>
                            <Button onClick={handleClose} className='linkBtn me-3'>
                                Cancel
                            </Button>
                            <Button onClick={handleClose} className='mainBtn'>
                                Create
                            </Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            {
                addLeadModal?.isShow && (
                    <LeadForm
                        show={addLeadModal?.isShow}
                        modalData={addLeadModal?.modalData}
                        isEditMode={addLeadModal?.isEditMode}
                        onHide={hideLeadModal}
                        handleConfirm={handleLeadConfirm}
                    />
                )
            }
        </Container>
    )
}
