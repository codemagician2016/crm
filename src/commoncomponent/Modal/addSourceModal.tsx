import { Form, Modal, Button } from "react-bootstrap";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { IAddSource } from "@/utils/interfaces/sources";

interface IAddSourceModal {
    show: boolean,
    modalData: any,
    isEditMode: boolean,
    onHide: () => void;
    handleConfirm: (data: any) => void;
}

const validationSchema = Yup.object({
    title: Yup.string().required('* Required'),
});

const AddSourceModal = ({ show, modalData, isEditMode, onHide, handleConfirm }: IAddSourceModal) => {
    const defaultSource: IAddSource = {
        title: "",
        status: "active",
    }

    const [sourceInfo, setSourceInfo] = useState<IAddSource>(defaultSource);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: sourceInfo,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: () => {
            handleConfirm(values);
        }
    });

    const getDefaultFormValue = () => {
        const updatedData = {
            title: modalData?.title || "",
            status: modalData?.status || "",
        };
        setSourceInfo(updatedData);
    }

    useEffect(() => {
        if (isEditMode) {
            getDefaultFormValue();
        }
    }, [modalData])

    return (
        <>
            <Modal centered show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title className='heading'>{isEditMode ? 'Edit Source' : 'Add New Source'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="">
                            <Form.Label>Source Name <span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder=""
                                name="title"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values?.title}
                            />
                            {
                                (errors?.title && touched?.title) && (
                                    <span className='form-error'>{typeof errors?.title == "string" ? errors?.title : '* Required'}</span>
                                )
                            }
                        </Form.Group>
                        <Form.Label>Status</Form.Label>
                        <div key={`inline-radio`} className="mb-3">
                            <Form.Check
                                inline
                                label="Active"
                                name="group1"
                                type="radio"
                                id={`active`}
                                checked={values?.status === "active"}
                                onClick={() => setFieldValue("status" ,"active")}
                            />
                            <Form.Check
                                inline
                                label="Inactive"
                                name="group1"
                                type="radio"
                                id={`inactive`}
                                checked={values?.status === "inactive"}
                                onClick={() => setFieldValue("status" ,"inactive")}
                            />

                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='linkBtn' variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button className='mainBtn' type="submit" variant="primary" >
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

export default AddSourceModal;