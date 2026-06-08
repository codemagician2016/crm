import React, { useEffect } from 'react'
import { useState } from 'react';
import { Button, Card, Container, Form, InputGroup, Modal, Table } from 'react-bootstrap';
import moment from 'moment';
import Styles from '../../styles/leads.module.scss'
import { IoIosSearch } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import { CgAddR, CgMoreVerticalO } from "react-icons/cg";
import { TbEdit } from "react-icons/tb";
import { Alert, IconButton, Menu, MenuItem, Snackbar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { HiOutlineTrash } from 'react-icons/hi2';
import { ISnackbar } from '@/utils/interfaces/common';
import Api from '@/utils/helper/api';
import { ISourceFilter } from '@/utils/interfaces/sources';
import Loader from '@/commoncomponent/Loader/index';
import { sourceStatusOptions } from '@/utils/helper/constants';
import AddSourceModal from '@/commoncomponent/Modal/addSourceModal';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
import ConfirmModal from '@/commoncomponent/Modal/confirmModal';
import { DEFAULT_PAGE_ITEMS, getPaginationIndex } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';
const ITEM_HEIGHT = 48;

const RowActionMenu = ({ rowData, showSourceModal, showDeleteSourceModal }: any) => {
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
                    showSourceModal(rowData, true);
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
                    showDeleteSourceModal(rowData);
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

function Sources() {
    const [isLoading, setIsLoading] = useState(false);
    const [sourceData, setSourceData] = useState<any>([]);
    const [sourceRes, setSourceRes] = useState<any>(null);
    const [isSaveLoader, setIsSaveLoader] = useState(false);
    const api = new Api();
    const [addSourceModal, setAddSourceModal] = React.useState<any>({ isShow: false, modalData: null, isEditMode: false });
    const [deleteSourceModal, setDeleteSourceModal] = React.useState<any>({ isShow: false, modalData: null });
    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });

    const defaultFilter = {
        page: 1,
        search: '',
    }
    const [appliedFilters, setAppliedFilters] = useState<ISourceFilter>(defaultFilter);


    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }

    const getSourcesData = async () => {
        try {
            setIsLoading(true);
            let params: any = {
                page: appliedFilters?.page,
                limit: DEFAULT_PAGE_ITEMS,
            }
            if (appliedFilters?.search) {
                params.search = appliedFilters?.search;
            }
            const res = await api.get(`/sources`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data || [];
                setSourceData(updatedData);
                setSourceRes(res?.data);
            } else {
                setSourceData([]);
                setSourceRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const handleSourceConfirm = async (values: any) => {
        try {
            setIsSaveLoader(true);
            let payload: any = {
                title: values?.title,
                status: values?.status,
            }
            if (addSourceModal?.isEditMode) {
                const res = await api.post(`/sources/${addSourceModal?.modalData?._id}`, payload);
                setIsSaveLoader(false);
                if (res?.status === 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Source Updated Successfully' });
                    hideSourceModal();
                    getSourcesData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
                }
            } else {
                const res = await api.put(`/sources`, payload);
                setIsSaveLoader(false);
                if (res?.status == 200) {
                    setSnackbarInfo({ isShow: true, variant: 'success', message: 'Source Added Successfully' });
                    hideSourceModal();
                    getSourcesData();
                } else {
                    setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went worng' });
                }
            }
        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const handleSourceDelete = async () => {
        try {
            setIsSaveLoader(true);
            const res = await api.delete(`/sources/${deleteSourceModal?.modalData?._id}`);
            setIsSaveLoader(false);
            if (res?.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Source Deleted Successfully' });
                hideDeleteSourceModal();
                getSourcesData();
            } else {
                setSnackbarInfo({ isShow: true, variant: 'error', message: res?.data?.message || 'Something went wrong' });
            }

        } catch (error: any) {
            setIsSaveLoader(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    }

    const showSourceModal = (data: any, isEdit: boolean) => {
        setAddSourceModal({ isShow: true, modalData: data, isEditMode: isEdit });
    };

    const hideSourceModal = () => {
        setAddSourceModal({ isShow: false, modalData: null, isEditMode: false });
    };

    const showDeleteSourceModal = (data: any) => {
        setDeleteSourceModal({ isShow: true, modalData: data });
    };

    const hideDeleteSourceModal = () => {
        setDeleteSourceModal({ isShow: false, modalData: null });
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
        let label = (sourceStatusOptions)?.find(item => item?.value === status)?.label || '';
        return label;
    }

    useEffect(() => {
        getSourcesData();
    }, [appliedFilters])

    return (
        <Container>
            <div className='main'>

                <Card className={`mt-0 ${Styles.liCard}`}>
                    <Card.Header className={Styles.liCardHeader}>
                        <div className='d-flex justify-content-between align-items-center'>
                            <h2 className='title'>Source <span>10</span></h2>
                            <div className='d-flex justify-content-end'>
                                <InputGroup className={`${Styles.search} w-50`}>
                                    <InputGroup.Text>
                                        <IoIosSearch />
                                    </InputGroup.Text>
                                    <Form.Control placeholder='Search Source' onChange={(e: any) => handleSearchChange(e?.target?.value)} />
                                </InputGroup>
                                <Button onClick={() => showSourceModal(null, false)} className='addBtn ms-3'>
                                    <div><CgAddR style={{ fontSize: 14, marginRight: 8 }} />  </div>
                                    <div>Add Source</div>
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
                                            : (sourceData || [])?.length
                                                ? (sourceData || [])?.map((source: any, index: any) => (
                                                    <tr key={index}>
                                                        <td>{getPaginationIndex(index, appliedFilters?.page)}</td>
                                                        <td>{source?.title}</td>
                                                        <td>{source?.createdAt ? moment(source?.createdAt).format('DD MMM YYYY') : 'N/A'}</td>
                                                        <td><div className={`${source?.status}`}>{getStatusLabel(source?.status)}</div></td>
                                                        <td>
                                                            {
                                                                !source?.is_default && (
                                                                    <RowActionMenu
                                                                        showSourceModal={showSourceModal}
                                                                        showDeleteSourceModal={showDeleteSourceModal}
                                                                        rowData={source}
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
                                totalPages={sourceRes?.totalPages || 1}
                                currentPage={appliedFilters?.page}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            {
                addSourceModal?.isShow && (
                    <AddSourceModal
                        show={addSourceModal?.isShow}
                        modalData={addSourceModal?.modalData}
                        isEditMode={addSourceModal?.isEditMode}
                        onHide={hideSourceModal}
                        handleConfirm={handleSourceConfirm}
                    />
                )
            }
            {
                deleteSourceModal?.isShow && (
                    <ConfirmModal
                        show={deleteSourceModal?.isShow}
                        heading='Delete Source'
                        content={"Do you want to delete the source?"}
                        handleClose={hideDeleteSourceModal}
                        handleConfirm={handleSourceDelete}
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

export default Sources