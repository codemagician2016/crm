import { Form, Modal, Button, Row, Col } from "react-bootstrap";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from "react";
import { IAddSource } from "@/utils/interfaces/sources";
import { IAddContactStage } from "@/utils/interfaces/contactStage";

interface IAddContactStageModal {
    show: boolean,
    modalData: any,
    isEditMode: boolean,
    onHide: () => void;
    handleConfirm: (data: any) => void;
}

const validationSchema = Yup.object({
    title: Yup.string().required('* Required'),
    bgColor: Yup.string().required('* Required'),
    textColor: Yup.string().required('* Required'),
});

const AddContactStageModal = ({ show, modalData, isEditMode, onHide, handleConfirm }: IAddContactStageModal) => {
    const defaultContactStage: IAddContactStage = {
        title: "",
        status: "active",
        bgColor: "",
        textColor: ""
    }

    const [stageInfo, setStageInfo] = useState<IAddContactStage>(defaultContactStage);

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setFieldValue } = useFormik({
        initialValues: stageInfo,
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
            bgColor: modalData?.bgColor || "",
            textColor: modalData?.textColor || "",
        };
        setStageInfo(updatedData);
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
                    <Modal.Title className='heading'>{isEditMode ? 'Edit Contact Stages' : 'Add New Contact Stages'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="">
                            <Form.Label>Contact Stage <span className='text-danger'>*</span></Form.Label>
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
                        <Row>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label htmlFor="exampleColorInput">Bg Color <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control
                                        type="color"
                                        name="bgColor"
                                        onChange={(e) => setFieldValue('bgColor', e?.target?.value || "")}
                                        onBlur={handleBlur}
                                        value={values?.bgColor}
                                        title="Choose your color"
                                    />
                                    {
                                        (errors?.bgColor && touched?.bgColor) && (
                                            <span className='form-error'>{typeof errors?.bgColor == "string" ? errors?.bgColor : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="">
                                    <Form.Label htmlFor="exampleColorInput">Text Color <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control
                                        type="color"
                                        name="textColor"
                                        onChange={(e) => setFieldValue('textColor', e?.target?.value || "")}
                                        onBlur={handleBlur}
                                        value={values?.textColor}
                                        title="Choose your color"
                                    />
                                    {
                                        (errors?.textColor && touched?.textColor) && (
                                            <span className='form-error'>{typeof errors?.textColor == "string" ? errors?.textColor : '* Required'}</span>
                                        )
                                    }
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Label>Status</Form.Label>
                        <div key={`inline-radio`} className="mb-3">
                            <Form.Check
                                inline
                                label="Active"
                                name="group1"
                                type="radio"
                                id={`active`}
                                checked={values?.status === "active"}
                                onClick={() => setFieldValue("status", "active")}
                            />
                            <Form.Check
                                inline
                                label="Inactive"
                                name="group1"
                                type="radio"
                                id={`inactive`}
                                checked={values?.status === "inactive"}
                                onClick={() => setFieldValue("status", "inactive")}
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

export default AddContactStageModal;