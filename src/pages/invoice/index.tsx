import React, { useEffect } from 'react'
import { useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Offcanvas, Row, Table } from 'react-bootstrap';
import { Snackbar, Alert, IconButton, Menu, MenuItem } from '@mui/material';
import Styles from '../../styles/leads.module.scss'
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR, CgLogOut } from "react-icons/cg";
import { TbSortAscending2Filled } from "react-icons/tb";
import { FaAngleDown } from 'react-icons/fa'
import { TbFilterShare } from "react-icons/tb";
import { HiPrinter } from "react-icons/hi2";
import { LuIndianRupee } from "react-icons/lu";
import { TiEye } from "react-icons/ti";
import { Divider } from '@mui/material';
import moment from 'moment';
import Api from '@/utils/helper/api';
import Loader from '@/commoncomponent/Loader/index';
import { ISnackbar } from '@/utils/interfaces/common';
import InvoiceForm from '@/commoncomponent/Form/invoiceForm';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
import { invoiceSortOptions } from '@/utils/helper/constants';
import { IInvoiceFilter } from '@/utils/interfaces/invoice';
import CustomDateRangePicker from '@/commoncomponent/CustomDateRangePicker/index';
import { generateHtmlCssForPdf } from '@/utils/helper/pdf';
import { IOrganization } from '@/utils/interfaces/organization';
import PdfViewerModal from '@/commoncomponent/Modal/pdfViewerModal';
import { DEFAULT_PAGE_ITEMS } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';

const ITEM_HEIGHT = 48;
function Invoice() {
    const api = new Api();
    const [isLoading, setIsLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState<any>([]);
    const [invoiceRes, setInvoiceRes] = useState<any>(null);
    const [orgDetail, setOrgDetail] = useState<IOrganization | null>(null);
    const [isSaveLoader, setIsSaveLoader] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [addInvoiceModal, setAddInvoiceModal] = React.useState<any>({ isShow: false });
    const [showPreviewModal, setShowPreviewModal] = useState<any>({ isShow: false, fileUrl: '' });
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });

    const defaultFilter = {
        page: 1,
        sort: invoiceSortOptions[0],
        search: '',
        transaction_start_date: moment().startOf('month').toDate(),
        transaction_end_date: moment().endOf('month').toDate(),
    }
    const [appliedFilters, setAppliedFilters] = useState<IInvoiceFilter>(defaultFilter);

    const ITEM_HEIGHT = 48;
    const [anchorSortEl, setAnchorSortEl] = React.useState<null | HTMLElement>(null);
    const openSort = Boolean(anchorSortEl);

    const showSort = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorSortEl(event.currentTarget);
    };
    const hideSort = () => {
        setAnchorSortEl(null);
    };

    const open = Boolean(anchorEl);

    const showInvoiceModal = () => {
        setAddInvoiceModal({ isShow: true });
    };
    const hideInvoiceModal = () => {
        setAddInvoiceModal({ isShow: false });
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handlemenuClose = () => {
        setAnchorEl(null);
    };
    const handleStatusMenuClose = () => {
        setAnchorEl(null);
    };
    const [selectedValue, setSelectedValue] = React.useState<number>(0);

    const handleToggle = (value: number) => () => {
        setSelectedValue(value);
    };
    const [showStatus, setStatusShow] = useState(false);

    const handleStatusClose = () => setStatusShow(false);
    const handleStatusShow = () => setStatusShow(true);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const selectionRange = {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }

    const getInvoiceData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
                sort_field: appliedFilters?.sort?.sort_field,
                sort_order: appliedFilters?.sort?.sort_order,
                stage: 'All',
            }

            if (appliedFilters?.transaction_start_date && appliedFilters?.transaction_end_date) {
                params.transaction_start_date = moment(appliedFilters?.transaction_start_date)?.format('YYYY-MM-DD');
                params.transaction_end_date = moment(appliedFilters?.transaction_end_date)?.format('YYYY-MM-DD');
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/invoices`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setInvoiceData(updatedData);
                setInvoiceRes(res?.data);
            } else {
                setInvoiceData([]);
                setInvoiceRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }


    const handleInvoiceConfirm = async (values: any) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                leadId: values?.selected_lead?._id,
                payment_method: values?.payment_method,
                amount: Number(values?.amount),
                // closing_amount: Number(values?.payment_details?.closing_amount),
                transaction_date: values?.transaction_date,
                due_date: values?.due_date,
                description: "",
                currency: values?.currency,
            }
            const res = await api.put(`/invoices`, payload);
            setIsSaveLoader(false);
            if (res?.status == 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Invoice Added Successfully' });
                hideInvoiceModal();
                getInvoiceData();
            } else {
                setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const getOrganizationDetail = async () => {
        try {
            const res = await api.get(`/organization/detail`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || {};
                setOrgDetail(updatedData || {});
            } else {
                setOrgDetail(null);
            }
        } catch (error: any) {
        }
    }

    const handlePreview = async (invoiceId: string, isDownload: boolean = false) => {
        try {
            setIsSaveLoader(true);
            const invoiceRes = await api.get(`/invoices/${invoiceId}`);
            const invoiceDetail = invoiceRes?.data?.data || null;
            const payload = await generateHtmlCssForPdf({ invoiceDetail: invoiceDetail, orgInfo: orgDetail }, 'invoice');
            const res = await api.post(`/pdf`, payload);

            const base64PDF = res.data?.data;
            const pdfBytes = new Uint8Array(atob(base64PDF).split('').map(char => char.charCodeAt(0)));
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            const pdfURL = URL.createObjectURL(pdfBlob);

            if (isDownload) {
                if (!pdfURL) {
                    return;
                }
                const link = document.createElement("a");
                link.href = pdfURL;
                link.download = `${invoiceDetail?.invoiceId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setShowPreviewModal({ isShow: true, fileUrl: pdfURL, fileNamePrefix: invoiceDetail?.invoiceId || 'invoice' });
            }
        } catch (err) {
            console.log("preview error", err);
        } finally {
            setIsSaveLoader(false);
        }
    }

    const hidePdfPreviewModal = () => {
        setShowPreviewModal({ isShow: false, fileUrl: '' });
    }

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }

    const handleSortChange = (sort: any) => {
        setAppliedFilters({
            ...appliedFilters,
            sort: sort,
        });
        hideSort();
    }

    const handlePageChange = (value: any) => {
        setAppliedFilters({
            ...appliedFilters,
            page: (value || 1),
        });
    }

    const handleSearchChange = (value: any) => {
        setAppliedFilters({
            ...appliedFilters,
            page: 1,
            search: (value || ''),
        });
    }

    const handleDateRangeChange = (rangeKey: any) => {
        const startDate = rangeKey?.range1?.startDate;
        const endDate = rangeKey?.range1?.endDate;

        setAppliedFilters({
            ...appliedFilters,
            page: 1,
            transaction_start_date: startDate || null,
            transaction_end_date: endDate || null,
        });
    }

    useEffect(() => {
        getInvoiceData();
    }, [appliedFilters])

    useEffect(() => {
        getOrganizationDetail();
    }, [])


    return (
        <Container>
            <div className='main'>

                <Card className={`mt-0 ${Styles.liCard}`}>
                    <Card.Header className={Styles.liCardHeader}>
                        <div className='d-flex justify-content-between align-items-center'>
                            <h2 className='title'>Invoice <span>100</span></h2>
                            <Button onClick={showInvoiceModal} className='addBtn'>
                                <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Add New Invoice</div>
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className={Styles.filterSection}>
                            <InputGroup className={Styles.search}>
                                <InputGroup.Text>
                                    <IoIosSearch />
                                </InputGroup.Text>
                                <Form.Control placeholder='Search Invoices' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
                            </InputGroup>
                            <div className='d-flex justify-content-end w-100'>
                                <Button className='filter me-3' onClick={showSort}>
                                    <div><TbSortAscending2Filled style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                    <div>Sort</div>
                                    <div><FaAngleDown style={{ fontSize: 14, marginLeft: 8 }} />  </div>
                                </Button>
                                <Menu
                                    className='boxShadow px-3'
                                    id="long-menu"
                                    MenuListProps={{
                                        'aria-labelledby': 'long-button',
                                    }}
                                    sx={{ paddingRight: 8 }}
                                    anchorEl={anchorSortEl}
                                    open={openSort}
                                    onClose={hideSort}
                                    slotProps={{
                                        paper: {
                                            style: {
                                                maxHeight: ITEM_HEIGHT * 4.5,
                                            },
                                        },
                                    }}
                                >
                                    {
                                        invoiceSortOptions?.map(item => (
                                            <MenuItem
                                                className={(item?.label === appliedFilters?.sort?.label) ? 'selected-menu-item' : ''}
                                                onClick={() => handleSortChange(item)}
                                                sx={{
                                                    fontSize: 14,
                                                    '&:hover': {
                                                        borderRadius: 1
                                                    },
                                                }}
                                            >
                                                {item?.label}
                                            </MenuItem>
                                        ))
                                    }
                                </Menu>
                                <CustomDateRangePicker
                                    startDate={appliedFilters?.transaction_start_date}
                                    endDate={appliedFilters?.transaction_end_date}
                                    handleDateRangeChange={handleDateRangeChange}
                                    classes=''
                                />

                                {/* <Button className='range'>
                                    <div><TbFilterShare style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                    <div>Filter</div>
                                </Button> */}
                            </div>
                        </div>
                        <Table className='mt-3' >
                            <thead>
                                <tr>
                                    <th className="">Payment ID</th>
                                    <th className="">Lead Name</th>
                                    <th className="">Amount</th>
                                    <th>Payment Date</th>
                                    <th>Payment Method</th>
                                    <th>Invoice ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    isLoading
                                        ? (
                                            <tr>
                                                <td colSpan={7}>
                                                    <div className='no-data-found'>
                                                        <Loader />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : (invoiceData)?.length
                                            ? (invoiceData || [])?.map((invoice: any, index: any) => (
                                                <tr key={index}>
                                                    <td>{invoice?.paymentDetail?.paymentId}</td>
                                                    <td className=''><div className='name'>{invoice?.leadDetail?.name}</div></td>
                                                    <td className=' whitespace-nowrap'>$ {invoice?.amount}</td>
                                                    <td className='whitespace-nowrap'>{invoice?.transaction_date ? moment(invoice?.transaction_date).format('DD MMM YYYY') : ''}</td>
                                                    <td className='whitespace-nowrap'>{invoice?.payment_method}</td>
                                                    <td className='whitespace-nowrap'>{invoice?.invoiceId}</td>

                                                    <td>

                                                        <IconButton
                                                            aria-label="more"
                                                            onClick={() => handlePreview(invoice?._id, true)}
                                                        >
                                                            <HiPrinter style={{ color: '#1ECBE2', marginRight: 8 }} />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))
                                            : (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <div className='no-data-found'>
                                                            No Data Found
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                }


                            </tbody>
                        </Table>
                        <CustomPagination
                            totalPages={invoiceRes?.totalPages || 1}
                            currentPage={appliedFilters?.page}
                            onPageChange={handlePageChange}
                        />
                    </Card.Body>
                </Card>
            </div>
            {
                addInvoiceModal?.isShow && (
                    <InvoiceForm
                        show={addInvoiceModal?.isShow}
                        modalData={null}
                        onHide={hideInvoiceModal}
                        handleConfirm={handleInvoiceConfirm}
                    />
                )
            }
            {/* {
                showPreviewModal?.isShow && (
                    <PdfViewerModal
                        isShow={showPreviewModal?.isShow}
                        onHide={hidePdfPreviewModal}
                        pdfFile={showPreviewModal?.fileUrl}
                        fileNamePrefix={showPreviewModal?.fileNamePrefix}
                    />
                )
            } */}
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

        </Container>
    )
}

export default Invoice