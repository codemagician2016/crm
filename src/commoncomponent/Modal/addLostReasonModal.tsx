import { Form, Modal, Button } from "react-bootstrap";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { IAddSource } from "@/utils/interfaces/sources";
import { IAddLostReason } from "@/utils/interfaces/lostReason";

interface IAddLostReasonModal {
    show: boolean,
    modalData: any,
    isEditMode: boolean,
    onHide: () => void;
    handleConfirm: (data: any) => void;
}

const validationSchema = Yup.object({
    title: Yup.string().required('* Required'),
});

const AddLostReasonModal = ({ show, modalData, isEditMode, onHide, handleConfirm }: IAddLostReasonModal) => {
    const defaultSource: IAddSource = {
        title: "",
        status: "active",
    }

    const [reasonInfo, setReasonInfo] = useState<IAddLostReason>(defaultSource);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: reasonInfo,
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
        setReasonInfo(updatedData);
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
                    <Modal.Title className='heading'>{isEditMode ? 'Edit Reason' : 'Add New Reason'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="">
                            <Form.Label>Reason <span className='text-danger'>*</span></Form.Label>
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

export default AddLostReasonModal;