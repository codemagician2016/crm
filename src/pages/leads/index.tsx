import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, Modal, Offcanvas, Row, Table } from 'react-bootstrap'
import Styles from '../../styles/leads.module.scss'
import moment from 'moment';
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR } from "react-icons/cg";
import { TbEdit, TbSortAscending2Filled } from "react-icons/tb";
import { FaAngleDown } from 'react-icons/fa'
import { TbFilterShare } from "react-icons/tb";
import { HiMiniEllipsisVertical } from "react-icons/hi2";
import { LuIndianRupee } from "react-icons/lu";
import TextArea from '@/commoncomponent/textarea';
import { Snackbar, Alert, Menu, MenuItem, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import Link from 'next/link';
import Api from '@/utils/helper/api';
import Loader from '@/commoncomponent/Loader/index';
import CustomPagination from '@/commoncomponent/pagination/index';
import LeadForm from '@/commoncomponent/Form/leadForm';
import { ISnackbar } from '@/utils/interfaces/common';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
import { leadSortOptions, LeadStatuses, leadStatusOptions, UserRoles } from '@/utils/helper/constants';
import { ILeadFilter, IUpdateLead } from '@/utils/interfaces/leads';
import CustomDateRangePicker from '@/commoncomponent/CustomDateRangePicker/index';
import FilterComponent from '@/commoncomponent/FilterComponent/index';
import { DEFAULT_PAGE_ITEMS, getPaginationIndex } from '@/utils/helper';
import { useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice } from '../../../redux/slices/authSlice';
import { IUserData } from '@/utils/interfaces/user';
function Deals() {
    const [isLoading, setIsLoading] = useState(false);
    const [leadData, setLeadData] = useState<any>([]);
    const [leadRes, setLeadRes] = useState<any>(null);
    const [isSaveLoader, setIsSaveLoader] = useState(false);
    const api = new Api();
    const authSlice = useAppSelector(getAuthSlice);
    const userData: IUserData | null = authSlice ? authSlice?.userData : null;
    const isAdmin = ((userData?.role === UserRoles.ADMIN) || (userData?.role === UserRoles.SUPER_ADMIN));
    const [addLeadModal, setAddLeadModal] = React.useState<any>({ isShow: false, modalData: null, isEditMode: false });
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });
    const [isInitLoader, setIsInitLoader] = useState(false);

    const defaultFilterKey = 'leadStatus';
    const defaultFilter = {
        page: 1,
        sort: leadSortOptions[0],
        search: '',
        followup_start_date: moment().startOf('month').toDate(),
        followup_end_date: moment().endOf('month').toDate(),
        leadStatus: [],
        owner: [],
    }
    const filterKeys = [
        {
            label: 'Status',
            value: 'leadStatus'
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
    const [appliedFilters, setAppliedFilters] = useState<ILeadFilter>(defaultFilter);
    const [selectedFilterData, setSelectedFilterData] = useState<any>([]);
    const [selectedFilterInfo, setSelectedFilterInfo] = useState({ key: defaultFilterKey });
    const [employeeList, setEmployeeList] = useState<any>([]);
    const [stageList, setStageList] = useState<any>([]);

    const ITEM_HEIGHT = 48;
    const [anchorSortEl, setAnchorSortEl] = React.useState<null | HTMLElement>(null);
    const openSort = Boolean(anchorSortEl);

    const showSort = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorSortEl(event.currentTarget);
    };
    const hideSort = () => {
        setAnchorSortEl(null);
    };

    const showLeadModal = (data: any, isEdit: boolean) => {
        setAddLeadModal({ isShow: true, modalData: data, isEditMode: isEdit });
    };
    const hideLeadModal = () => {
        setAddLeadModal({ isShow: false, modalData: null, isEditMode: false });
    };

    const getLeadsData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
                sort_field: appliedFilters?.sort?.sort_field,
                sort_order: appliedFilters?.sort?.sort_order,
                stage: 'All',
            }

            if (appliedFilters?.followup_start_date && appliedFilters?.followup_end_date) {
                params.followup_start_date = moment(appliedFilters?.followup_start_date)?.format('YYYY-MM-DD');
                params.followup_end_date = moment(appliedFilters?.followup_end_date)?.format('YYYY-MM-DD');
            }
            if (appliedFilters?.leadStatus?.length) {
                params.statuses = (appliedFilters?.leadStatus || [])?.map(item => item?.value)?.join(',');
            }
            if (appliedFilters?.owner?.length) {
                params.owner_ids = (appliedFilters?.owner || [])?.map(item => item?.value)?.join(',');
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/lead`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setLeadData(updatedData);
                setLeadRes(res?.data);
            } else {
                setLeadData([]);
                setLeadRes(null);
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
                ownerId: isAdmin ? values?.ownerId : userData?._id,
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
            } else {
                const res = await api.put(`/lead`, payload);
                setIsSaveLoader(false);
                if (res?.status == 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lead Added Successfully' });
                    hideLeadModal();
                    getLeadsData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
                }
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
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

    const getContactStagesData = async () => {
        try {
            const res = await api.get(`/contact-stages`);
            if (res?.status == 200) {
                const updatedData = (res?.data?.data || [])?.map((item: any) => ({ label: item?.title, value: item?._id }));
                setStageList(updatedData);
            } else {
                setStageList([]);
            }
        } catch (error: any) {

        }
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
            followup_start_date: startDate || null,
            followup_end_date: endDate || null,
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
        if (selectedFilterInfo?.key == 'leadStatus') {
            currentData = stageList;
        } else if (selectedFilterInfo?.key == 'owner') {
            currentData = employeeList;
        }

        setSelectedFilterData([...currentData]);
    }


    useEffect(() => {
        getLeadsData();
    }, [appliedFilters])

    useEffect(() => {
        updateSelectedFilterList();
    }, [selectedFilterInfo, isInitLoader])

    useEffect(() => {
        const fetchInitData = async () => {
            setIsInitLoader(true);

            await Promise.all([
                getEmployeeData(),
                getContactStagesData(),
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
                            <h2 className='title m-0 me-3'>Leads <span>100</span></h2>
                            <Button onClick={() => showLeadModal(null, false)} className='addBtn'>
                                <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Add Lead</div>
                            </Button>

                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className={Styles.filterSection}>
                            <InputGroup className={Styles.search}>
                                <InputGroup.Text>
                                    <IoIosSearch />
                                </InputGroup.Text>
                                <Form.Control aria-label="Dollar amount (with dot and two decimal places)" placeholder='Search Leads' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
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
                                        leadSortOptions?.map(item => (
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
                                    startDate={appliedFilters?.followup_start_date}
                                    endDate={appliedFilters?.followup_end_date}
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
                        <div className=''>
                            <Table className='mt-3 ' responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Lead Name</th>
                                        {/* <th>Company Name</th> */}
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Lead Status</th>
                                        <th>Created Date</th>
                                        <th>Followup Date</th>
                                        <th>Source</th>
                                        <th>Lead Owner</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        isLoading
                                            ? (
                                                <tr>
                                                    <td colSpan={9}>
                                                        <div className='no-data-found'>
                                                            <Loader />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            : (leadData)?.length
                                                ? (leadData || [])?.map((lead: any, index: any) => (
                                                    <tr key={index}>
                                                        <td>{getPaginationIndex(index, appliedFilters?.page)}</td>
                                                        <td><Link href={`/leads/${lead?._id}`}>{lead?.name}</Link></td>
                                                        <td>{lead?.phoneNo || 'N/A'}</td>
                                                        <td>{lead?.email || 'N/A'}</td>
                                                        <td>
                                                            <div
                                                                className={` status`}
                                                                style={{ backgroundColor: (lead?.status_details?.bgColor || ''), color: (lead?.status_details?.textColor || '') }}
                                                            >
                                                                {lead?.status_details?.title || ''}
                                                            </div>
                                                        </td>
                                                        <td>{lead?.createdAt ? moment(lead?.createdAt).format('DD MMM YYYY') : 'N/A'}</td>
                                                        <td>{lead?.followUpDate ? moment(lead?.followUpDate).format('DD MMM YYYY') : 'N/A'}</td>
                                                        <td>{lead?.source_details?.title || 'N/A'}</td>
                                                        <td>{lead?.ownerName || 'N/A'}</td>
                                                        <td>
                                                            {
                                                                (lead?.status_details?.code !== LeadStatuses.CLOSE) && (
                                                                    <Button className='' variant="link" onClick={() => showLeadModal(lead, true)}>
                                                                        <TbEdit style={{ color: '#10375C' }} />
                                                                    </Button>
                                                                )
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                                : (
                                                    <tr>
                                                        <td colSpan={9}>
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
                                totalPages={leadRes?.totalPages || 1}
                                currentPage={appliedFilters?.page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
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

export default Deals
