import { useState } from "react"
import { Button, Modal } from "react-bootstrap"

interface IConfirmModal {
    show: boolean,
    heading: string,
    content: any,
    handleClose: () => void,
    handleConfirm: () => void,
}

const ConfirmModal = ({ show, heading, content, handleClose, handleConfirm }: IConfirmModal) => {

    return (
        <Modal className="confirmModal" show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="heading">{heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="content_text">
                    {content}
                </div>
            </Modal.Body>
            <Modal.Footer className="justify-end">
                <Button className='linkBtn' variant="secondary" type="button" onClick={handleClose}>
                    Cancel
                </Button>
                <Button className='mainBtn' variant="primary" type="button" onClick={handleConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ConfirmModal;