import React, { useEffect } from 'react'
import { useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Modal, Row, Table } from 'react-bootstrap'
import Styles from '../../styles/leads.module.scss'
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR, CgMoreVerticalO } from "react-icons/cg";
import { TbEdit } from "react-icons/tb";
import { Alert, Box, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { HiOutlineTrash } from 'react-icons/hi2';
import Api from '@/utils/helper/api';
import { ISnackbar } from '@/utils/interfaces/common';
import { IContactStageFilter } from '@/utils/interfaces/contactStage';
import { contactStatusOptions } from '@/utils/helper/constants';
import moment from 'moment';
import Loader from '@/commoncomponent/Loader';
import AddContactStageModal from '@/commoncomponent/Modal/addContactStageModal';
import ConfirmModal from '@/commoncomponent/Modal/confirmModal';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
import { DEFAULT_PAGE_ITEMS } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';
const ITEM_HEIGHT = 48;

const RowActionMenu = ({ rowData, showStageModal, showDeleteModal }: any) => {
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
                    showStageModal(rowData, true);
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
                    showDeleteModal(rowData);
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

function ContactStages() {
    const [isLoading, setIsLoading] = useState(false);
    const [stagesData, setStagesData] = useState<any>([]);
    const [stagesRes, setStagesRes] = useState<any>(null);
    const [isSaveLoader, setIsSaveLoader] = useState(false);
    const api = new Api();
    const [addStageModal, setAddStageModal] = React.useState<any>({ isShow: false, modalData: null, isEditMode: false });
    const [deleteModal, setDeleteModal] = React.useState<any>({ isShow: false, modalData: null });
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });

    const defaultFilter = {
        page: 1,
        search: '',
    }
    const [appliedFilters, setAppliedFilters] = useState<IContactStageFilter>(defaultFilter);

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }

    const getContactStagesData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/contact-stages`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setStagesData(updatedData);
                setStagesRes(res?.data);
            } else {
                setStagesData([]);
                setStagesRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const handleContactStageConfirm = async (values: any) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                title: values?.title,
                status: values?.status,
                bgColor: values?.bgColor,
                textColor: values?.textColor,
            }
            if (addStageModal?.isEditMode) {
                const res = await api.post(`/contact-stages/${addStageModal?.modalData?._id}`, payload);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Contact Stage Updated Successfully' });
                    hideStageModal();
                    getContactStagesData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            } else {
                const res = await api.put(`/contact-stages`, payload);
                setIsSaveLoader(false);
                if (res?.status == 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Contact Stage Added Successfully' });
                    hideStageModal();
                    getContactStagesData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
                }
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const handleContactStageDelete = async () => {
        try {
            setIsSaveLoader(true);
            const res = await api.delete(`/contact-stages/${deleteModal?.modalData?._id}`);
            setIsSaveLoader(false);
            if (res?.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Contact Stage Deleted Successfully' });
                hideDeleteModal();
                getContactStagesData();
            } else {
                setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
            }

        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const showStageModal = (data: any, isEdit: boolean) => {
        setAddStageModal({ isShow: true, modalData: data, isEditMode: isEdit });
    };

    const hideStageModal = () => {
        setAddStageModal({ isShow: false, modalData: null, isEditMode: false });
    };

    const showDeleteModal = (data: any) => {
        setDeleteModal({ isShow: true, modalData: data });
    };

    const hideDeleteModal = () => {
        setDeleteModal({ isShow: false, modalData: null });
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
        let label = (contactStatusOptions)?.find(item => item?.value === status)?.label || '';
        return label;
    }

    useEffect(() => {
        getContactStagesData();
    }, [appliedFilters])

    return (
        <Container>
            <div className='main'>
                <Card className={`mt-0 ${Styles.liCard}`}>
                    <Card.Header className={Styles.liCardHeader}>
                        <div className='d-flex justify-content-between align-items-center'>
                            <h2 className='title'>Contact Stages <span>10</span></h2>
                            <div className='d-flex justify-content-end'>
                            <InputGroup className={`${Styles.search} w-50`}>
                                    <InputGroup.Text>
                                        <IoIosSearch />
                                    </InputGroup.Text>
                                    <Form.Control placeholder='Search Contact Stages' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
                                </InputGroup>
                                <Button onClick={() => showStageModal(null, false)} className='addBtn ms-3'>
                                    <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                    <div>Add Contact Stages</div>
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
                                            : (stagesData || [])?.length
                                                ? (stagesData || [])?.map((stage: any, index: any) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td><Box sx={{ backgroundColor: (stage?.bgColor || ''), color: (stage?.textColor), borderRadius: 1, maxWidth: 100, textAlign: 'center', fontSize: 13, paddingY: "2px" }}>{stage?.title}</Box></td>
                                                        <td>{stage?.createdAt ? moment(stage?.createdAt).format('DD MMM YYYY') : 'N/A'}</td>
                                                        <td><div className={`${stage?.status}`}>{getStatusLabel(stage?.status)}</div></td>
                                                        <td>
                                                            {
                                                                !stage?.is_default && (
                                                                    <RowActionMenu
                                                                        showStageModal={showStageModal}
                                                                        showDeleteModal={showDeleteModal}
                                                                        rowData={stage}
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
                                totalPages={stagesRes?.totalPages || 1}
                                currentPage={appliedFilters?.page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {
                addStageModal?.isShow && (
                    <AddContactStageModal
                        show={addStageModal?.isShow}
                        modalData={addStageModal?.modalData}
                        isEditMode={addStageModal?.isEditMode}
                        onHide={hideStageModal}
                        handleConfirm={handleContactStageConfirm}
                    />
                )
            }
            {
                deleteModal?.isShow && (
                    <ConfirmModal
                        show={deleteModal?.isShow}
                        heading='Delete Contact Stage'
                        content={"Do you want to delete the contact stage?"}
                        handleClose={hideDeleteModal}
                        handleConfirm={handleContactStageDelete}
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

export default ContactStages