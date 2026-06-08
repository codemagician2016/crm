import React, { useEffect } from 'react'
import { useState } from 'react';
import { Button, Card, Container, Form, InputGroup, Modal, Table } from 'react-bootstrap'
import Styles from '../../styles/leads.module.scss'
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR, CgMoreVerticalO } from "react-icons/cg";
import { TbEdit } from "react-icons/tb";
import { Alert, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { HiOutlineTrash } from 'react-icons/hi2';
import Api from '@/utils/helper/api';
import { ISnackbar } from '@/utils/interfaces/common';
import { ILostReasonFilter } from '@/utils/interfaces/lostReason';
import { lostReasonStatusOptions } from '@/utils/helper/constants';
import Loader from '@/commoncomponent/Loader';
import moment from 'moment';
import AddLostReasonModal from '@/commoncomponent/Modal/addLostReasonModal';
import ConfirmModal from '@/commoncomponent/Modal/confirmModal';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
import { DEFAULT_PAGE_ITEMS, getPaginationIndex } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';
const ITEM_HEIGHT = 48;

const RowActionMenu = ({ rowData, showReasonModal, showDeleteReasonModal }: any) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                className='boxShadow px-3'
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                sx={{ paddingRight: 8 }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '20ch',
                            paddingLeft: 16,
                            paddingRight: 16,
                        },
                    },
                }}
            >
                <MenuItem onClick={() => {
                    showReasonModal(rowData, true);
                    handleClose();
                }}
                    sx={{
                        fontSize: 14,
                        '&:hover': {
                            borderRadius: 1
                        },
                    }}>
                    <TbEdit style={{ color: '#eb8316', marginRight: 8 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    showDeleteReasonModal(rowData);
                    handleClose();
                }}
                    sx={{
                        fontSize: 14,
                        '&:hover': {
                            borderRadius: 1
                        },
                    }}>
                    <HiOutlineTrash style={{ color: '#C11907', marginRight: 8 }} />
                    Delete
                </MenuItem>
            </Menu>
        </>
    )
}


function LostReason() {
    const [isLoading, setIsLoading] = useState(false);
    const [reasonData, setReasonData] = useState<any>([]);
    const [reasonRes, setReasonRes] = useState<any>(null);
    const [isSaveLoader, setIsSaveLoader] = useState(false);
    const api = new Api();
    const [addReasonModal, setAddReasonModal] = React.useState<any>({ isShow: false, modalData: null, isEditMode: false });
    const [deleteReasonModal, setDeleteReasonModal] = React.useState<any>({ isShow: false, modalData: null });
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });

    const defaultFilter = {
        page: 1,
        search: '',
    }
    const [appliedFilters, setAppliedFilters] = useState<ILostReasonFilter>(defaultFilter);

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }

    const getReasonsData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/lost-reason`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setReasonData(updatedData);
                setReasonRes(res?.data);
            } else {
                setReasonData([]);
                setReasonRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const handleReasonConfirm = async (values: any) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                title: values?.title,
                status: values?.status,
            }
            if (addReasonModal?.isEditMode) {
                const res = await api.post(`/lost-reason/${addReasonModal?.modalData?._id}`, payload);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lost Reason Updated Successfully' });
                    hideReasonModal();
                    getReasonsData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            } else {
                const res = await api.put(`/lost-reason`, payload);
                setIsSaveLoader(false);
                if (res?.status == 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lost Reason Added Successfully' });
                    hideReasonModal();
                    getReasonsData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
                }
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const handleReasonDelete = async () => {
        try {
            setIsSaveLoader(true);
            const res = await api.delete(`/lost-reason/${deleteReasonModal?.modalData?._id}`);
            setIsSaveLoader(false);
            if (res?.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lost Reason Deleted Successfully' });
                hideDeleteReasonModal();
                getReasonsData();
            } else {
                setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
            }

        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const showReasonModal = (data: any, isEdit: boolean) => {
        setAddReasonModal({ isShow: true, modalData: data, isEditMode: isEdit });
    };

    const hideReasonModal = () => {
        setAddReasonModal({ isShow: false, modalData: null, isEditMode: false });
    };

    const showDeleteReasonModal = (data: any) => {
        setDeleteReasonModal({ isShow: true, modalData: data });
    };

    const hideDeleteReasonModal = () => {
        setDeleteReasonModal({ isShow: false, modalData: null });
    };

    const handleSearchChange = (value: any) => {
        setAppliedFilters({
            ...appliedFilters,
            page: 1,
            search: (value || ''),
        });
    }

    const handlePageChange = (value: any) => {
        setAppliedFilters({
            ...appliedFilters,
            page: (value || 1),
        });
    }


    const getStatusLabel = (status: any) => {
        let label = (lostReasonStatusOptions)?.find(item => item?.value === status)?.label || '';
        return label;
    }

    useEffect(() => {
        getReasonsData();
    }, [appliedFilters])

    return (
        <Container>
            <div className='main'>
                
                <Card className={`mt-0 ${Styles.liCard}`}>
                    <Card.Header className={Styles.liCardHeader}>
                        <div className='d-flex justify-content-between align-items-center'>
                        <h2 className='title'>Lost Reason <span>10</span></h2>
                        <div className='d-flex justify-content-end'>
                          <InputGroup className={`${Styles.search} w-50`}>
                                <InputGroup.Text>
                                    <IoIosSearch />
                                </InputGroup.Text>
                                <Form.Control placeholder='Search Lost Reason' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
                            </InputGroup>
                            <Button onClick={() => showReasonModal(null, false)} className='addBtn ms-3'>
                                <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                <div>Add Reason</div>
                            </Button>
                          </div>

                        </div>
                    </Card.Header>
                    <Card.Body>

                        <div className=''>
                            <Table className='mt-30' responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Created At</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                        isLoading
                                            ? (
                                                <tr>
                                                    <td colSpan={5}>
                                                        <div className='no-data-found'>
                                                            <Loader />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            : (reasonData || [])?.length
                                                ? (reasonData || [])?.map((reason: any, index: any) => (
                                                    <tr key={index}>
                                                        <td>{getPaginationIndex(index, appliedFilters?.page || 1)}</td>
                                                        <td>{reason?.title}</td>
                                                        <td>{reason?.createdAt ? moment(reason?.createdAt).format('DD MMM YYYY') : 'N/A'}</td>
                                                        <td><div className={`${reason?.status}`}>{getStatusLabel(reason?.status)}</div></td>
                                                        <td>
                                                            {
                                                                !reason?.is_default && (
                                                                    <RowActionMenu
                                                                        showReasonModal={showReasonModal}
                                                                        showDeleteReasonModal={showDeleteReasonModal}
                                                                        rowData={reason}
                                                                    />
                                                                )
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                                : (
                                                    <tr>
                                                        <td colSpan={5}>
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
                                totalPages={reasonRes?.totalPages || 1}
                                currentPage={appliedFilters?.page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            {
                addReasonModal?.isShow && (
                    <AddLostReasonModal
                        show={addReasonModal?.isShow}
                        modalData={addReasonModal?.modalData}
                        isEditMode={addReasonModal?.isEditMode}
                        onHide={hideReasonModal}
                        handleConfirm={handleReasonConfirm}
                    />
                )
            }
            {
                deleteReasonModal?.isShow && (
                    <ConfirmModal
                        show={deleteReasonModal?.isShow}
                        heading='Delete Lost Reason'
                        content={"Do you want to delete the lost reason?"}
                        handleClose={hideDeleteReasonModal}
                        handleConfirm={handleReasonDelete}
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
        </Container>
    )
}

export default LostReason