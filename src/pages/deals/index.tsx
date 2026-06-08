
import React, { useEffect, useRef, useState } from 'react'
import { Container, Card, Button, Form, Table, Breadcrumb } from 'react-bootstrap'
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import Api from '@/utils/helper/api';
import { IUserData } from '@/utils/interfaces/user';
import { AddLead } from '@/utils/interfaces/leads';
import { ISnackbar } from '@/utils/interfaces/common';
import moment from 'moment';
import { FaEdit } from 'react-icons/fa';
import { Alert, Chip, Snackbar, TextField, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation'

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/material/styles';
import TabComponent from '@/commoncomponent/tabs';
import { title } from 'process';
import CardComponent from '@/commoncomponent/Card';
import CustomTable from '@/commoncomponent/Table';
import Loader from '@/commoncomponent/Loader';
import { PrimaryButton } from '@/commoncomponent/Button';
import { IoMdAdd } from 'react-icons/io'
import { ISourcesData } from '@/utils/interfaces/sources';
import socket from '../../../socket/index';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const stages = [
    "New",
    "Qualify",
    "Negotiation",
    "Convert",
    "Not Interested",
    "Backout",
    "Convert by competitor"
]

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const tabTypes = {
    todays: 'today',
    past: 'past',
    future: 'future',
    newLeads: 'New',
    all: 'All',
    openLeads: 'Qualify',
    convertedLeads: 'Convert',
    notInterested: 'Not Interested',
    backOut: 'Backout',
    convertByCompetitor: 'Convert by competitor'
}

export default function Leads() {

    const router = useRouter();

    const [leadsList, setLeadsList] = useState<AddLead[]>([]);
    const searchParams = useSearchParams()
    const stage = searchParams.get("stage");
    const [selectedTab, setSelectedTab] = useState(stage && stage != '' ? stage : tabTypes.todays);
    const [isLoading, setIsLoading] = useState(false);
    const api = new Api();
    const [employeeList, setEmployeeList] = useState<IUserData[]>([]);

    const [snackbarInfo, setSnackbarInfo] = useState<ISnackbar>({ isShow: false, variant: '', message: '' });
    const [editModalShow, setEditModalShow] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');
    const [convertModalShow, setConvertModalShow] = useState(false);
    const [assigneeModalShow, setAssigneeModalShow] = useState(false);
    const [finalPrice, setFinalPrice] = useState('');
    const [counts, setCounts] = useState<any>({});
    const [assignToId, setAssignToId] = useState('');
    const [sources, setSources] = useState<ISourcesData[]>([]);
    const [services, setServices] = useState<ISelectOption[]>([]);
    const leadCountsRef = useRef<any>({});
    const leadListRef = useRef<AddLead[]>([]);

    const handleCloseSnackbar = () => {
        setSnackbarInfo({ isShow: false, variant: '', message: '' });
    }

    const getEmployeeData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/user`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setEmployeeList(updatedData || []);
            } else {
                setEmployeeList([]);
            }
            setIsLoading(false)
        } catch (error: any) {
            setSnackbarInfo({ isShow: true, variant: 'error', message: 'Failed to get employee data' });
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getEmployeeData();
        getServicesData();
        getSourceData();

        socket?.connect();

        socket?.on("connect", () => {
          console.log("Connected to Socket.io:", socket.id);
        });

        socket?.on("connect_error", (error: any) => {
            console.log('connection error =>', error?.message, error);
        });
    
        socket?.on("add-lead", (lead: any) => {
          const updatedCounts = { ...leadCountsRef?.current };
          updatedCounts['New'] = (updatedCounts['New'] || 0) + 1;
          updatedCounts['all'] = (updatedCounts['all'] || 0) + 1;

          const updatedLeadList = [...leadListRef.current];
          updatedLeadList.unshift(lead);

          setCounts({ ...updatedCounts });
          setLeadsList([ ...updatedLeadList ]);

          leadCountsRef.current = updatedCounts;
          leadListRef.current = updatedLeadList;
        });
    
        socket?.on("disconnect", () => {
          console.log("Disconnected from Socket.io");
        });

        console.log("socket leads",socket);
    
        return () => {
          socket?.disconnect();
        };
    }, [])

    const handleStageUpdate = async (index: any, leadId?: string) => {
        if (stages[index] === 'Negotiation') {
            setEditModalShow(true);
        } else if (stages[index] === 'Convert') {
            setConvertModalShow(true);
        } else {
            updateStage(index, leadId);
        }
    };

    const handleAssigneeModal = async (assignToId: string) => {
        setAssignToId(assignToId);
        setAssigneeModalShow(true);
    };

    const updateStage = async (index: any, leadId?: string) => {
        try {
            setIsLoading(true);
            const res = await api.post(`/lead/${leadId}`, { stage: stages[index] });
            if (res.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Stage updated successfully' });
                await getLeadsList();
            }
            setIsLoading(false);
        } catch (error) {
            setSnackbarInfo({ isShow: true, variant: 'error', message: 'Failed to update stage' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleAssigneeUpdate = async (leadId?: string) => {
        try {
            setIsLoading(true);
            const res = await api.post(`/lead/${leadId}`, { assignToId });
            if (res.status === 200) {
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Assignee updated successfully' });
                await getLeadsList();
            }
        } catch (error) {
            setSnackbarInfo({ isShow: true, variant: 'error', message: 'Failed to update assignment' });
        } finally {
            setIsLoading(false);
        }
    }


    const getLeadsList = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/lead?stage=${selectedTab}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data.leadsList;
                setLeadsList(updatedData || []);
                leadListRef.current = updatedData || [];
            } else {
                setLeadsList([]);
                leadListRef.current = [];
            }
            handleCloseAssigneeModal();
            getLeadsCount();
            setIsLoading(false);
        } catch (error: any) {
            setSnackbarInfo({ isShow: true, variant: 'error', message: 'Failed to get leads' });
            setIsLoading(false);
        }
    }

    const getLeadsCount = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/lead/counts`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data.counts;
                setCounts(updatedData);
                leadCountsRef.current = updatedData;
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getLeadsList();
        getLeadsCount();
    }, [selectedTab])

    const handleUpdateQuotePrice = async (_id?: string) => {
        setIsLoading(true);
        try {
            const res = await api.post(`/lead/${_id}`, { quotePrice: quotePrice, stage: stages[2] });

            if (res?.status === 200) {
                getLeadsList();
                handleCloseEditModal();
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lead updated successfully' });
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went worng' });
        }
    };

    const handleUpdateConvertPrice = async (_id?: string) => {
        try {
            setIsLoading(true);
            const res = await api.post(`/lead/${_id}`, { finalPrice: finalPrice, stage: stages[3] });
            if (res?.status === 200) {
                await getLeadsList();
                handleCloseConvertModal();
                setSnackbarInfo({ isShow: true, variant: 'success', message: 'Lead converted successfully' });
            }
        } catch (error: any) {
            setSnackbarInfo({ isShow: true, variant: 'error', message: error?.response?.data?.message || 'Something went wrong' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseConvertModal = () => {
        setFinalPrice('');
        setConvertModalShow(false);
    };

    const handleCloseEditModal = () => {
        setQuotePrice('');
        setEditModalShow(false);
    };

    const handleCloseAssigneeModal = () => {
        setAssignToId('');
        setAssigneeModalShow(false);
    };

    const handleKeyDown = (e: any, leadId?: string) => {
        if (e.key === 'Enter') {
            if (editModalShow) {
                handleUpdateQuotePrice(leadId);
            } else if (convertModalShow) {
                handleUpdateConvertPrice(leadId);
            }
        }
    };

    const tabs = [
        {
            key: tabTypes.todays,
            title: `Today's Activity (${counts.todays ? counts.todays : 0})`,
        },
        {
            key: tabTypes.past,
            title: `Past Activity (${counts.past ? counts.past : 0})`,
        },
        {
            key: tabTypes.future,
            title: `Future Activity (${counts.future ? counts.future : 0})`,
        },
        {
            key: tabTypes.newLeads,
            title: `New Leads (${counts['New'] ? counts['New'] : 0})`,
        },
        {
            key: tabTypes.all,
            title: `All Leads (${counts.all ? counts.all : 0})`,
        },
        {
            key: tabTypes.openLeads,
            title: `Open Leads (${counts['Qualify'] ? counts['Qualify'] : 0})`,
        },
        {
            key: tabTypes.convertedLeads,
            title: `Converted Leads (${counts['Convert'] ? counts['Convert'] : 0})`,
        },
        {
            key: tabTypes.notInterested,
            title: `Not Interested (${counts['Not Interested'] ? counts['Not Interested'] : 0})`,
        },
        {
            key: tabTypes.backOut,
            title: `BackOut (${counts['Backout'] ? counts['Backout'] : 0})`,
        },
        {
            key: tabTypes.convertByCompetitor,
            title: `Converted by Competitor (${counts['Convert by competitor'] ? counts['Convert by competitor'] : 0})`,
        }
    ]

    const handleTabChange = (key: string) => {
        setSelectedTab(key);
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

    const getTableData = () => {
        return (
            {
                labels: ['Name', 'Contact No', 'Email', 'Business Name', 'Source', 'Created At', 'Product / Service', 'Follow up date', 'Assign to', 'Stage', 'Action'],
                colData: leadsList.map((lead) => ({
                    colData: {
                        name: lead?.name,
                        contact: lead?.phoneNo,
                        email: lead?.email,
                        businessName: lead?.businessName != "" ? lead?.businessName : "N/A",
                        source: (() => {
                            const matchedSource = sources.find(row => row?.value === lead?.source);
                            return matchedSource ? matchedSource?.label : "N/A";
                        })(),
                        createdAt: moment(lead?.createdAt).format("ddd MMM DD YYYY"),
                        productService: (() => {
                            const matchedService = services.find(row => row?.value === lead?.service);
                            return matchedService ? matchedService?.label : "N/A";
                        })(),
                        followUp: lead?.followUpDate ? moment(lead?.followUpDate).format("ddd MMM DD YYYY") : 'N/A',
                        assignTo: {
                            display: (
                                <><select
                                    value={lead?.assignToId}
                                    onChange={(e) => handleAssigneeModal(e.target.value)}
                                    className="form-select"
                                >
                                    {lead?.assignToId == null && <option value={lead?.assignToId}>Select</option>}
                                    {employeeList.map((row, index) => (
                                        <option key={index} value={row?._id}>
                                            {row?.name}
                                        </option>
                                    ))}
                                </select><BootstrapDialog
                                    className="commonDialog"
                                    open={assigneeModalShow}
                                    onClose={handleCloseAssigneeModal}
                                    aria-labelledby="confirm-edit-modal"
                                    aria-describedby="confirm-edit-description"
                                    BackdropProps={{
                                        style: { backgroundColor: 'transparent' }
                                    }}
                                >
                                        <Box>
                                            <DialogTitle className='p-3'>
                                                Confirm Change Assignee
                                            </DialogTitle>
                                            <DialogActions className="p-3" sx={{ textAlign: 'center', justifyContent: 'center' }}>
                                                <Button onClick={handleCloseAssigneeModal}>
                                                    Cancel
                                                </Button>
                                                <PrimaryButton isDisabled={false} label='Confirm' onClick={() => handleAssigneeUpdate(lead._id)} />
                                            </DialogActions>
                                        </Box>
                                    </BootstrapDialog></>
                            ),
                        },
                        stage: {
                            display: (
                                <><select
                                    value={lead?.stage}
                                    onChange={(e) => handleStageUpdate(stages.indexOf(e.target.value), lead?._id)}
                                    className="form-select"
                                >
                                    {stages.map((stage, index) => (
                                        <option key={index} value={stage}>
                                            {stage}
                                        </option>
                                    ))}
                                </select>
                                    <BootstrapDialog
                                        className="commonDialog"
                                        open={editModalShow}
                                        onClose={handleCloseEditModal}
                                        aria-labelledby="confirm-edit-modal"
                                        aria-describedby="confirm-edit-description"
                                        BackdropProps={{
                                            style: { backgroundColor: 'transparent' } 
                                        }}
                                    >
                                        <Box>
                                            <DialogTitle className='p-3'>
                                                Add Quote Price
                                            </DialogTitle>
                                            <DialogContent dividers>
                                                <Typography id="confirm-edit-description" sx={{}}>
                                                    Please enter the quote price for Negotiation
                                                </Typography>
                                                <div className=''>
                                                    <TextField className='mb-3'
                                                        id="quotePrice"
                                                        fullWidth
                                                        label="Quote Price"
                                                        variant="standard"
                                                        type="number"
                                                        name="quotePrice"
                                                        value={quotePrice}
                                                        onKeyDown={(e) => handleKeyDown(e, lead?._id)}
                                                        onChange={(e) => setQuotePrice(e.target.value)} />
                                                </div>
                                            </DialogContent>
                                            <DialogActions className="p-3" sx={{ textAlign: 'center', justifyContent: 'center' }}>
                                                <Button onClick={handleCloseEditModal}>
                                                    Cancel
                                                </Button>
                                                <PrimaryButton label='Confirm' isDisabled={quotePrice == ''} onClick={() => handleUpdateQuotePrice(lead?._id)} />
                                            </DialogActions>
                                        </Box>
                                    </BootstrapDialog>
                                    <BootstrapDialog
                                        className="commonDialog"
                                        open={convertModalShow}
                                        onClose={handleCloseConvertModal}
                                        aria-labelledby="confirm-convert-modal"
                                        aria-describedby="confirm-convert-description"
                                        BackdropProps={{
                                            style: { backgroundColor: 'transparent' },
                                        }}
                                    >
                                        <Box>
                                            <DialogTitle className="p-3">
                                                Add Final Price
                                            </DialogTitle>
                                            <DialogContent dividers>
                                                <Typography id="confirm-convert-description">
                                                    Please enter the final price for conversion
                                                </Typography>
                                                <div className="mt-3">
                                                    <TextField
                                                        id="finalPrice"
                                                        fullWidth
                                                        label="Final Price"
                                                        variant="standard"
                                                        type="number"
                                                        name="finalPrice"
                                                        value={finalPrice}
                                                        onKeyDown={(e) => handleKeyDown(e, lead?._id)}
                                                        onChange={(e) => setFinalPrice(e.target.value)} />
                                                </div>
                                            </DialogContent>
                                            <DialogActions className="p-3" sx={{ textAlign: 'center', justifyContent: 'center' }}>
                                                <Button onClick={handleCloseConvertModal}>
                                                    Cancel
                                                </Button>
                                                <PrimaryButton label='Confirm' isDisabled={finalPrice === ''} onClick={() => handleUpdateConvertPrice(lead?._id)} />
                                            </DialogActions>
                                        </Box>
                                    </BootstrapDialog></>
                            ),
                        },
                        action:
                        {
                            display: (
                                <Button className="editBtn" variant="link" onClick={() => router.push(`/leads/${lead?._id}`)}>
                                    <FaEdit />
                                </Button>
                            ),
                        }
                    },
                })),

            }
        )
    }
    const tableData = getTableData();

    const getTabContent = () => {
        return (
            <CardComponent>
                <CustomTable tableData={tableData} totalPages={1} currentPage={1} setCurrentPage={(page) => {}} />
            </CardComponent>
        )
    }

    return (
        <Container>
            <div className='main px-0'>
                <Breadcrumb className='mb-3'>
                    <Breadcrumb.Item href="#" >Home / Leads</Breadcrumb.Item>
                </Breadcrumb>
                <div>
                    <Card>
                        <Card.Header>
                            <div className='d-flex justify-content-between mb-0 align-items-center'>
                                <Card.Title className='cardTitle'>
                                    Leads
                                </Card.Title>
                                <PrimaryButton label='Add Lead' onClick={() => router.push('/leads/create')} icon={<IoMdAdd style={{ fontSize: 20, marginRight: 3 }} />} isDisabled={false} />
                            </div>
                        </Card.Header>
                        <Card.Body className='p-0'>
                            <TabComponent tabs={tabs} tabContent={getTabContent()} handleTabChange={handleTabChange} selectedTab={selectedTab} isLoading={isLoading} />
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </Container>
    )
}
