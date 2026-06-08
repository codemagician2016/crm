import { PrimaryButton } from "@/commoncomponent/Button";
import CardComponent from "@/commoncomponent/Card"
import Input from "@/commoncomponent/Input"
import Select from "@/commoncomponent/Select";
import Api from "@/utils/helper/api";
import { userRoleOptions, UserRoles } from "@/utils/helper/constants";
import { IUserData } from "@/utils/interfaces/user";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Breadcrumb } from "react-bootstrap";
import * as Yup from 'yup';


const validationSchema = Yup.object({
    name: Yup.string().required("Please enter name"),
    email: Yup.string().email().required("Please enter email"),
    password: Yup.string().required("Please enter price"),
    role: Yup.string().required("Please enter tax"),
    phoneNo: Yup.number().required("Please enter SKU"),
});


const AddEmployee = () => {
    const [isSaveLoader, setIsSaveLoader] = useState<boolean>(false);

    const router = useRouter();
    const employeeId = router.query?.empId;
    const api = new Api();

    const defaultUser = {
        name: '',
        email: '',
        password: '',
        role: UserRoles.ADMIN,
        phoneNo: undefined
    }

    const onSubmitData = async () => {
        try {
            setIsSaveLoader(true);
            const payload: IUserData = { ...values };
            if (employeeId) {
                delete payload['password'];
            }
            const res = employeeId ? await api.post(`/user/${employeeId}`, payload) : await api.put(`/user`, payload);
            if (res?.status == 200) {
                resetForm();
                router.push('/employee');
            }
            setIsSaveLoader(false);
        } catch (err) {
            setIsSaveLoader(false);
        }
    }

    const getEmpDetail = async () => {
        try {
            const resp = await api.get(`/user/${employeeId}`);
            if (resp?.status == 200) {
                setValues(resp?.data?.data);
            }
        } catch (err) {

        }
    }

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue, resetForm }: FormikProps<IUserData> = useFormik<IUserData>({
        initialValues: defaultUser,
        validationSchema: validationSchema,
        onSubmit: () => {
            onSubmitData();
        },
    });

    useEffect(() => {
        if (employeeId && router.isReady) {
            getEmpDetail();
        }
    }, [router])

    return (
        <Container>
            <div className='main px-0'>
                <Breadcrumb className='mb-3'>
                    <Breadcrumb.Item href="#" >Home / Employee / Add Employee</Breadcrumb.Item>
                </Breadcrumb>
                <form onSubmit={handleSubmit}>
                    <CardComponent header="Add Employee">
                        <Row>
                            <Col xl={4} sm={6} className='mb-3'>
                                <Input label='Name' placeholder='Enter Name' name="name" value={values?.name} onChange={handleChange} onBlur={handleBlur}
                                    errorMsg={errors?.name && touched?.name ? errors['name'] : ''} />
                            </Col>
                            <Col xl={4} sm={6} className='mb-3'>
                                <Input label='Email' placeholder='Enter Email' name="email" value={values?.email} onChange={handleChange} onBlur={handleBlur}
                                    errorMsg={errors?.email && touched?.email ? errors['email'] : ''} />
                            </Col>
                            <Col xl={4} sm={6} className='mb-3'>
                                <Input label='Phone' placeholder='Enter Phone' name="phoneNo" value={values?.phoneNo} onChange={handleChange} onBlur={handleBlur}
                                    errorMsg={errors?.phoneNo && touched?.phoneNo ? errors['phoneNo'] : ''} />
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col xl={4} sm={6} className='mb-3'>
                                <Input label='Password' placeholder='Enter Password' type={employeeId ? "password" : "text"} name="password" value={values?.password} onChange={handleChange} onBlur={handleBlur}
                                    errorMsg={errors?.password && touched?.password ? errors['password'] : ''} disabled={!!employeeId} />
                            </Col>
                            <Col xl={4} sm={6} className='mb-3'>
                                <Select options={userRoleOptions} label='Role' name="role" value={values?.role} onChange={handleChange} onBlur={handleBlur}
                                    errorMsg={errors?.role && touched?.role ? errors['role'] : ''} />
                            </Col>
                        </Row>
                        <div className='text-center'>
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
                                <PrimaryButton onClick={() => { }} label={employeeId ? "Update" : "Add"} isDisabled={isSaveLoader} type='submit' />
                            }
                        </div>
                    </CardComponent>
                </form>
            </div>
        </Container>
    )
}

export default AddEmployee;