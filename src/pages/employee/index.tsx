import CustomPagination from '@/commoncomponent/pagination';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Container, Table } from 'react-bootstrap'
import Form from 'react-bootstrap/Form';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from 'next/navigation';
import Api from '@/utils/helper/api';
import { IUserData } from '@/utils/interfaces/user';
import { userRoleOptions, UserRoles } from '@/utils/helper/constants';
import Backdrop from '@/commoncomponent/Backdrop';
import Select from '@/commoncomponent/Select';
import { DEFAULT_PAGE_ITEMS, getPaginationIndex } from '@/utils/helper';
import Loader from '@/commoncomponent/Loader';
import SaveLoader from '@/commoncomponent/Loader/saveLoader';
// import { useRouter } from 'next/router';
// const router = useRouter();
// const handleAddEmployee = () => {
//   router.push('/addemployee');
// };
export default function EmployeeList() {

  const router = useRouter();
  const [employeeList, setEmployeeList] = useState<IUserData[]>([]);
  const [employeeRes, setEmployeeRes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveLoader, setIsSaveLoader] = useState(false);
  const api = new Api();
  const [currentPage, setCurrentPage] = useState(1);

  const getEmployeeData = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: DEFAULT_PAGE_ITEMS,
      }
      const res = await api.get(`/user`, params);
      if (res?.status == 200) {
        const updatedData = res?.data?.data;
        setEmployeeList(updatedData || []);
        setEmployeeRes(res?.data);
      } else {
        setEmployeeList([]);
        setEmployeeRes(null);
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false)
    }
  }


  const handleRoleChange = async (empData: IUserData, newRole: string) => {
    try {
      setIsSaveLoader(true);
      const payload: IUserData = {
        ...empData,
        role: newRole as UserRoles,
      };
      const res = await api.post(`/user/${empData?._id}`, payload);
      if (res?.status == 200) {
        getEmployeeData();
      }
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setIsSaveLoader(false);
    }
  };

  useEffect(() => {
    getEmployeeData();
  }, [currentPage])

  return (
    <Container>
      <div className='main'>
        <Breadcrumb className='mb-3'>
          <Breadcrumb.Item href="#" >Home / Employee</Breadcrumb.Item>
        </Breadcrumb>
        <Card >
          <Card.Body className='p-0'>
            <Card.Header>
              <div className='d-flex justify-between align-items-center'>
                <h4 className='cardTitle'>Employee List</h4>
                <Button className='addBtn' onClick={() => router.push('/employee/add')}>
                  <IoMdAdd style={{ fontSize: 20 }} />
                  Add Emp
                </Button>
              </div>
            </Card.Header>
            <Table hover>
              <thead>
                <tr>
                  <th className='text-center'>#</th>
                  <th>Name</th>
                  <th>Email Id</th>
                  <th>Mobile No</th>
                  <th>Lead</th>
                  <th>Role</th>
                  <th className='text-end'>Action</th>
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
                    : employeeList?.length > 0
                      ? (
                        employeeList.map((employee, index) => (
                          <tr key={employee?._id || index}>
                            <td className='text-center'>{getPaginationIndex(index, currentPage)}</td>
                            <td>{employee.name || 'N/A'}</td>
                            <td>{employee.email || 'N/A'}</td>
                            <td>{employee.phoneNo || 'N/A'}</td>
                            <td>
                              <Link href="/">
                                {0 || 'N/A'}
                              </Link>
                            </td>
                            <td>
                              <Form.Select
                                className="empType"
                                aria-label="Role select"
                                onChange={(e) => handleRoleChange(employee, e.target.value)}
                                value={employee.role}
                              >
                                <option value={UserRoles.SALESREP}>Sales Representative</option>
                                <option value={UserRoles.MANAGER}>Manager</option>
                                <option value={UserRoles.ADMIN}>Admin</option>
                                <option value={UserRoles.SUPER_ADMIN}>Super Admin</option>
                              </Form.Select>
                              {/* <Select options={userRoleOptions} value={employee?.role} /> */}
                            </td>
                            <td className='text-end'>
                              {/* <Button className="deleteBtn" variant="link">
                          <MdDelete />
                        </Button> */}
                              <Button className="editBtn" variant="link" onClick={() => router.push(`/employee/add?empId=${employee._id}`)}>
                                <FaEdit />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )
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
              totalPages={employeeRes?.totalPages || 1}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </Card.Body>
        </Card>
        {
          isSaveLoader && <SaveLoader isShow />
        }
      </div>
    </Container>
  )
}
