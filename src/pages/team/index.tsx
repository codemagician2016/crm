import { Checkbox, Chip, MenuItem, Select, Tab, Tabs } from '@mui/material'
import { useEffect, useState } from 'react';
import React from 'react'
import { Breadcrumb, Button, Card, CardBody, CardHeader, CardTitle, Container, Form, Modal, Spinner, Table } from 'react-bootstrap'
import Box from '@mui/material/Box';
import { MdDelete } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import { useAppSelector } from '../../../redux/storeHooks';
import { getAuthSlice } from '../../../redux/slices/authSlice';
import { IUserData } from '@/utils/interfaces/user';
import { UserRoles } from '@/utils/helper/constants';
import { ITeamData } from '@/utils/interfaces/teams';
import Api from '@/utils/helper/api';
import Backdrop from '@/commoncomponent/Backdrop';
import Loader from '@/commoncomponent/Loader';
import { DEFAULT_PAGE_ITEMS, getPaginationIndex } from '@/utils/helper';
import CustomPagination from '@/commoncomponent/pagination';
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

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
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Team() {
    const api = new Api();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const authSlice = useAppSelector(getAuthSlice);
    const userData: IUserData | null = authSlice ? authSlice?.userData : null;
    const [teamsData, setTeamsData] = useState<ITeamData[]>([]);
    const [teamsRes, setTeamsRes] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState<IUserData[]>([]);
    const [managerList, setManagersList] = useState<IUserData[]>([]);
    const [selectedManager, setSelectedManager] = useState(userData?.role == UserRoles.MANAGER ? userData?._id : '');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [isSaveLoader, setIsSaveLoader] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentPage(1);
        setValue(newValue);
    };


    const getEmployeeData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/userrole/${UserRoles.SALESREP}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setEmployeeList(updatedData);
            } else {
                setEmployeeList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getManagersList = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/userrole/${UserRoles.MANAGER}`);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setManagersList(updatedData);
            } else {
                setManagersList([]);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false)
        }
    }

    const getTeamsData = async () => {
        try {
            setIsLoading(true);
            const type = value === 0 ? "myTeam" : "allTeam";
            const params: any = {
                type: type,
                page: currentPage,
                limit: DEFAULT_PAGE_ITEMS,
            }
            const res = await api.get(`/team`, params);
            if (res?.status == 200) {
                const updatedData = res?.data?.data;
                setTeamsData(updatedData);
                setTeamsRes(res?.data);
            } else {
                setTeamsData([]);
                setTeamsRes(null);
            }
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getEmployeeData();
        getManagersList();
    }, [])

    useEffect(() => {
        getTeamsData();
    }, [value, currentPage])

    const handleSubmit = async () => {
        try {
            setIsSaveLoader(true);
            const res = await api.put(`/team`, { managerId: selectedManager, employeesId: selectedEmployees, addedById: userData?._id });
            if (res?.status == 200) {
                handleClose();
                getTeamsData();
            }
            setIsSaveLoader(false);
        } catch (err) {
            setIsSaveLoader(false);
        }
    }

    const handleDelete = async (teamId?: string) => {
        try {
            setIsSaveLoader(true);
            const res = await api.delete(`/team/${teamId}`);
            if (res?.status == 200) {
                getTeamsData();
            }
            setIsSaveLoader(false);
        } catch (err) {
            setIsSaveLoader(false);
        }
    }

    return (
        <Container>

            <div className='main'>
                <Breadcrumb className='mb-3'>
                    <Breadcrumb.Item href="#" >Home / Team</Breadcrumb.Item>
                </Breadcrumb>
                <Card>
                    <CardHeader>
                        <div className='d-flex justify-content-between align-items-center'>
                            <CardTitle className="cardTitle">Team</CardTitle>
                            {userData?.role !== UserRoles.SALESREP && <Button className='mainBtn' onClick={handleShow}>Add Team Member</Button>}
                        </div>
                    </CardHeader>
                    <CardBody className='px-0'>
                        <Box>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="My Team" {...a11yProps(0)} />
                                {userData?.role !== UserRoles.SALESREP && <Tab label="All Team" {...a11yProps(1)} />}
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th className='text-center'>#</th>
                                        <th>Emp Name</th>
                                        <th>Email Id</th>
                                        <th>Mobile No</th>
                                        <th>Lead</th>
                                        {userData?.role !== UserRoles.SALESREP && <th className='text-end pe-4'>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        isLoading
                                            ? (
                                                <tr>
                                                    <td colSpan={(userData?.role !== UserRoles.SALESREP) ? 6 : 5}>
                                                        <div className='no-data-found'>
                                                            <Loader />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            : teamsData?.length > 0
                                                ? (
                                                    teamsData.map((employee, index) => (
                                                        <tr key={employee?._id || index}>
                                                            <td className='text-center'>{getPaginationIndex(index, currentPage)}</td>
                                                            <td>{employee?.employeeName}</td>
                                                            <td>{employee?.employeeEmail}</td>
                                                            <td>{employee?.employeePhone}</td>
                                                            <td>
                                                                <Link href="">{employee?.totalLeads}</Link>
                                                            </td>
                                                            {userData?.role !== UserRoles.SALESREP && <td className='text-end'>
                                                                <Button className="deleteBtn" variant="link" onClick={() => handleDelete(employee?._id)}>
                                                                    <MdDelete />
                                                                </Button>
                                                            </td>}
                                                        </tr>
                                                    ))
                                                )
                                                :
                                                (
                                                    <tr>
                                                        <td colSpan={(userData?.role !== UserRoles.SALESREP) ? 6 : 5}>
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
                                totalPages={teamsRes?.totalPages || 1}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                            {/* </Card> */}
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <Table>
                                <thead>
                                    <tr>
                                        <th className='text-center'>#</th>
                                        <th>Manager Name</th>
                                        <th>Email Id</th>
                                        <th>Mobile No</th>
                                        <th>Team Member</th>
                                        <th className='text-end pe-4'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        isLoading ? (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className='no-data-found'>
                                                        <Loader />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                            : teamsData?.length > 0
                                                ? (
                                                    teamsData.map((manager, index) => (
                                                        <tr key={manager?._id || index}>
                                                            <td className='text-center'>{getPaginationIndex(index, currentPage)}</td>
                                                            <td>{manager?.managerName}</td>
                                                            <td>{manager?.managerEmail}</td>
                                                            <td>{manager?.managerPhone}</td>
                                                            <td>
                                                                <Link href="">{manager?.totalLeads}</Link>
                                                            </td>
                                                            <td className='text-end'>
                                                                <Button className="deleteBtn" variant="link" onClick={() => handleDelete(manager?._id)}>
                                                                    <MdDelete />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )
                                                :
                                                (
                                                    <tr>
                                                        <td colSpan={6}>
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
                                totalPages={teamsRes?.totalPages || 1}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </CustomTabPanel>
                    </CardBody>
                </Card>
                {
                    isSaveLoader && < Backdrop isShow={isSaveLoader} />
                }
            </div>
            <Modal centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className='heading'>Add Team Member</Modal.Title>
                </Modal.Header>
                <Modal.Body className=' align-middle'>
                    <div className='row h-100 align-items-center'>
                        <div className='col-md-12 mb-4'>
                            <Form.Label htmlFor="manager">Manager Name</Form.Label>
                            <Select
                                fullWidth
                                value={selectedManager}
                                onChange={(e) => setSelectedManager(e.target.value)}
                                disabled={userData?.role == UserRoles.MANAGER}
                            >
                                {managerList.map((row, index) => (
                                    <MenuItem key={row._id} value={row._id}>
                                        {row.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>
                        <div className='col-md-12 mb-4'>
                            <Form.Label htmlFor="manager">Emp Name</Form.Label>
                            <Select
                                fullWidth
                                labelId="employee-select-label"
                                multiple
                                value={selectedEmployees}
                                onChange={(e) => setSelectedEmployees(e.target.value as unknown as string[])}
                                renderValue={(selected: string[]) => (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {(selected as string[]).map((id) => {
                                            const emp = employeeList.find((emp) => emp._id === id);
                                            return emp ? <Chip key={id} label={emp.name} /> : null;
                                        })}
                                    </div>
                                )}
                            >
                                {employeeList.map((row) => (
                                    <MenuItem key={row._id} value={row._id}>
                                        <Checkbox checked={selectedEmployees.includes(row._id || '')} />
                                        {row.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    {isSaveLoader ?
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className='me-1'
                            />
                            Loading...
                        </>
                        :
                        <Button className='mainBtn w-20' onClick={handleSubmit} disabled={selectedEmployees.length == 0 || selectedManager == ''}>
                            Add
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </Container>
    )
}
