import React, { useEffect } from 'react'
import { useState } from 'react';
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Offcanvas, Row, Table } from 'react-bootstrap'
import Styles from '../../styles/leads.module.scss'
import moment from 'moment';
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR, CgLogOut } from "react-icons/cg";
import { TbEdit, TbFileInvoice, TbSortAscending2Filled } from "react-icons/tb";
import { FaAngleDown } from 'react-icons/fa'
import { TbFilterShare } from "react-icons/tb";
import { TiEye } from "react-icons/ti";
import { HiMiniEllipsisVertical, HiOutlineTrash, HiPrinter } from "react-icons/hi2";
import { LuIndianRupee } from "react-icons/lu";
import TextArea from '@/commoncomponent/textarea';
import { Avatar, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Radio, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Api from '@/utils/helper/api';
import Loader from '@/commoncomponent/Loader/index';
import { IPaymentFilter } from '@/utils/interfaces/payment';
import { paymentSortOptions, paymentStatusOptions, UserRoles } from '@/utils/helper/constants';
import CustomDateRangePicker from '@/commoncomponent/CustomDateRangePicker/index';
import FilterComponent from '@/commoncomponent/FilterComponent/index';
import Sidebar from '@/commoncomponent/Sidebar';
import { DEFAULT_PAGE_ITEMS } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';
import { useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice } from '../../../redux/slices/authSlice';
import { IUserData } from '@/utils/interfaces/user';
const ITEM_HEIGHT = 48;
function Payment() {
    const api = new Api();
    const authSlice = useAppSelector(getAuthSlice);
    const userData: IUserData | null = authSlice ? authSlice?.userData : null;
    const isAdmin = ((userData?.role === UserRoles.ADMIN) || (userData?.role === UserRoles.SUPER_ADMIN));
    const [isLoading, setIsLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>([]);
    const [paymentRes, setPaymentRes] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isInitLoader, setIsInitLoader] = useState(false);

    const defaultFilterKey = 'paymentStatus';
    const defaultFilter = {
        page: 1,
        sort: paymentSortOptions[0],
        search: '',
        due_start_date: moment().startOf('month').toDate(),
        due_end_date: moment().endOf('month').toDate(),
        paymentStatus: [],
        owner: [],
    }
    const filterKeys = [
        {
            label: 'Status',
            value: 'paymentStatus'
        },
        ...(
            isAdmin
                ? [
                    {
                        label: 'Owner',
                        value: 'owner'
                    }
                ]
                : []
        )
    ]
    const [appliedFilters, setAppliedFilters] = useState<IPaymentFilter>(defaultFilter);
    const [selectedFilterData, setSelectedFilterData] = useState<any>([]);
    const [selectedFilterInfo, setSelectedFilterInfo] = useState({ key: defaultFilterKey });
    const [employeeList, setEmployeeList] = useState<any>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handlemenuClose = () => {
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

    const ITEM_HEIGHT = 48;
    const [anchorSortEl, setAnchorSortEl] = React.useState<null | HTMLElement>(null);
    const openSort = Boolean(anchorSortEl);

    const showSort = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorSortEl(event.currentTarget);
    };
    const hideSort = () => {
        setAnchorSortEl(null);
    };

    const getPaymentData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
                sort_field: appliedFilters?.sort?.sort_field,
                sort_order: appliedFilters?.sort?.sort_order,
                stage: 'All',
            }

            if (appliedFilters?.due_start_date && appliedFilters?.due_end_date) {
                params.due_start_date = moment(appliedFilters?.due_start_date)?.format('YYYY-MM-DD');
                params.due_end_date = moment(appliedFilters?.due_end_date)?.format('YYYY-MM-DD');
            }
            if (appliedFilters?.paymentStatus?.length) {
                params.statuses = (appliedFilters?.paymentStatus || [])?.map(item => item?.value)?.join(',');
            }
            if (appliedFilters?.owner?.length) {
                params.owner_ids = (appliedFilters?.owner || [])?.map(item => item?.value)?.join(',');
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/payments`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setPaymentData(updatedData);
                setPaymentRes(res?.data);
            } else {
                setPaymentData([]);
                setPaymentRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getEmployeeData = async () => {
        try {
            // setIsLoading(true);
            const res = await api.get(`/user`);
            if (res?.status == 200) {
                const updatedData = (res?.data?.data || [])?.map((item: any) => ({ label: item?.name, value: item?._id }));
                setEmployeeList(updatedData || []);
            } else {
                setEmployeeList([]);
            }
            // setIsLoading(false);
        } catch (error: any) {
            // setIsLoading(false)
        }
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
            due_start_date: startDate || null,
            due_end_date: endDate || null,
        });
    }

    const handleFilterSelect = (data: any) => {
        let updatedFilters: any = { ...appliedFilters, page: 1 };
        if (data?.isChecked) {
            let updatedData = updatedFilters[data?.filterType] || [];
            updatedData.push(data?.item);
            updatedFilters[data?.filterType] = updatedData;
        } else {
            let updatedData = updatedFilters[data?.filterType] || [];
            let index = (updatedData)?.findIndex((val: any) => val?.value == data?.item?.value);
            if (index > -1) {
                updatedData?.splice(index, 1);
                updatedFilters[data?.filterType] = updatedData || [];
            }
        }

        setAppliedFilters({ ...updatedFilters });
    }

    const updateSelectedFilterInfo = (data: any) => {
        setSelectedFilterInfo({
            key: data || defaultFilterKey,
        });
    }

    const updateSelectedFilterList = () => {
        let currentData: any = [];
        if (selectedFilterInfo?.key == 'paymentStatus') {
            currentData = paymentStatusOptions;
        } else if (selectedFilterInfo?.key == 'owner') {
            currentData = employeeList;
        }

        setSelectedFilterData([...currentData]);
    }

    const getStatusLabel = (status: any) => {
        let label = (paymentStatusOptions)?.find(item => item?.value === status)?.label || '';
        return label;
    }

    useEffect(() => {
        getPaymentData();
    }, [appliedFilters])

    useEffect(() => {
        updateSelectedFilterList();
    }, [selectedFilterInfo, isInitLoader])

    useEffect(() => {
        const fetchInitData = async () => {
            setIsInitLoader(true);

            await Promise.all([
                getEmployeeData(),
            ]);

            setIsInitLoader(false);
        }
        fetchInitData();
    }, [])

    return (
        <Container>
            <div className='main'>

                <Card className={`mt-0 ${Styles.liCard}`}>
                    <Card.Header className={Styles.liCardHeader}>
                        <div className='d-flex justify-content-between align-items-center'>
                            <h2 className='title'>Payment <span>100</span></h2>

                            {/* <Button onClick={handleShow} className='addBtn'>
                                <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Add New Invoice</div>
                            </Button> */}

                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className={Styles.filterSection}>
                            <InputGroup className={Styles.search}>
                                <InputGroup.Text>
                                    <IoIosSearch />
                                </InputGroup.Text>
                                <Form.Control placeholder='Search Payment' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
                            </InputGroup>
                            <div className='d-flex'>
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
                                        paymentSortOptions?.map(item => (
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
                                    startDate={appliedFilters?.due_start_date}
                                    endDate={appliedFilters?.due_end_date}
                                    handleDateRangeChange={handleDateRangeChange}
                                    classes='me-3'
                                />
                                <FilterComponent
                                    appliedFilters={appliedFilters}
                                    handleFilterSelect={handleFilterSelect}
                                    selectedFilterData={selectedFilterData}
                                    selectedFilterInfo={selectedFilterInfo}
                                    updateSelectedFilterInfo={updateSelectedFilterInfo}
                                    filterKeys={filterKeys}
                                />
                            </div>
                        </div>
                        <div className='mw-100' style={{ overflowX: 'auto' }}>
                            <Table className='mt-3' responsive>
                                <thead>
                                    <tr>
                                        <th className="sticky-column">Payment ID</th>
                                        <th className="sticky-column">Lead Name</th>
                                        <th className="sticky-column">Phone No</th>
                                        <th>Product</th>
                                        <th>Lead Owner</th>
                                        <th>Due Date</th>
                                        <th>Amount</th>
                                        <th>Paid Amount</th>
                                        <th>Balance Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        isLoading
                                            ? (
                                                <tr>
                                                    <td colSpan={11}>
                                                        <div className='no-data-found'>
                                                            <Loader />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            : (paymentData)?.length
                                                ? (paymentData || [])?.map((payment: any, index: any) => (
                                                    <tr key={index}>
                                                        <td className='sticky-column'>{payment?.paymentId}</td>
                                                        <td className='sticky-column'><div className='name'>{payment?.leadDetail?.name}</div></td>
                                                        <td className='sticky-column whitespace-nowrap'>{payment?.leadDetail?.phoneNo}</td>
                                                        <td className='whitespace-nowrap'>{payment?.leadDetail?.productType}</td>
                                                        <td className='whitespace-nowrap'>{payment?.ownerName}</td>
                                                        <td className='whitespace-nowrap'>{payment?.due_date ? moment(payment?.due_date).format('DD MMM YYYY') : ''}</td>
                                                        <td className='whitespace-nowrap'>$ {payment?.closing_amount || 0}</td>
                                                        <td className='whitespace-nowrap'>$ {payment?.invoiceDetail?.totalAmount || 0}</td>
                                                        <td className='whitespace-nowrap'>$ {(payment?.closing_amount || 0) - (payment?.invoiceDetail?.totalAmount || 0)}</td>
                                                        <td onClick={handleStatusShow}>
                                                            <div className="new status">
                                                                {getStatusLabel(payment?.status)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Button className='' variant="link" onClick={() => {
                                                                setSelectedPayment(payment);  // bind selected row
                                                                handleShow();                 // open offcanvas
                                                            }}>
                                                                <TiEye style={{ color: '#10375C' }} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                                : (
                                                    <tr>
                                                        <td colSpan={11}>
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
                                totalPages={paymentRes?.totalPages || 1}
                                currentPage={appliedFilters?.page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <Offcanvas
                style={{ width: '650px', maxWidth: "100%" }} show={show} onHide={handleClose} placement='end' >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className='heading'>Payment <span>#{selectedPayment?.paymentId || 'N/A'}</span></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <h2 className='heading'>Proposal From & To</h2>
                    <Row>
                        <Col sm={6}>
                            <h2 className='heading my-3'>CRMS</h2>
                            <p className='address'>
                                994 Martine Ranch Suite 900
                                Candacefort New Hampshire
                            </p>
                            <p className='address'>
                                Phone : +1 98789 78788
                            </p>
                            <p className='address'>
                                Email : info@example.com
                            </p>
                        </Col>
                        <Col sm={6}>
                            <h2 className='heading my-3'>{selectedPayment?.leadDetail?.name}</h2>
                            <p className='address'>{selectedPayment?.leadDetail?.address || 'N/A'}</p>
                            <p className='address'>Phone : {selectedPayment?.leadDetail?.phoneNo}</p>
                            <p className='address'>Email : {selectedPayment?.leadDetail?.email || 'N/A'}</p>
                        </Col>
                    </Row>
                    <h2 className='heading mt-4 mb-3'>Payment Details</h2>
                    <div className='d-flex justify-content-between'>
                        <div className=''>
                            <h3 className='subHeading'>Due Date</h3>
                            <p className='text'>{selectedPayment?.due_date ? moment(selectedPayment.due_date).format('DD MMM YYYY') : 'N/A'}</p>
                        </div>
                        <div className=''>
                            <h3 className='subHeading'>Total Amount</h3>
                            <p className='text'>$ {selectedPayment?.leadDetail?.amount}</p>
                        </div>
                        <div className=''>
                            <h3 className='subHeading'>Closing Amount</h3>
                            <p className='text'>$ {selectedPayment?.closing_amount || 0}</p>
                        </div>
                    </div>
                    <Divider sx={{ opacity: 1 }} className='mt-3' />
                    <div className='mt-4 mb-3 d-flex justify-content-between align-items-center'>
                        <h2 className='heading '>Invoice Details</h2>
                        <p className='text'>Amount Due :
                            $100</p>
                    </div>
                    <div className='d-flex justify-content-between'>
                        <div className=''>
                            <h3 className='subHeading mb-2'>Invoice Number</h3>
                            <p className='heading'><span>#{selectedPayment?.invoiceDetail?.invoices?.[0].invoiceId}</span></p>
                        </div>
                        <div className=''>
                            <h3 className='subHeading mb-2'>Invoice Date</h3>
                            <p className='text'>{selectedPayment?.invoiceDetail?.invoices?.[0]?.createdAt
                                ? moment(selectedPayment.invoiceDetail.invoices[0].createdAt).format('DD MMM YYYY').toUpperCase()
                                : 'N/A'}</p>
                        </div>
                        <div className=''>
                            <h3 className='subHeading'>Payment Amount</h3>
                            <p className='text'>${selectedPayment?.invoiceDetail?.totalAmount}</p>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
            {/* <Modal centered show={showStatus} onHide={handleStatusClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {[0, 1, 2, 3].map((value) => {
        const labelId = `radio-list-label-${value}`;

        return (
          <ListItem
            key={value}
           
            disablePadding
          >
            <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
              <ListItemIcon>
                <Radio
                  edge="start"
                  checked={selectedValue === value}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal> */}
        </Container>
    )
}

export default Payment