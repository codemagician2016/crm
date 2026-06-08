import React, { useState } from "react";
import { Button, Modal } from 'react-bootstrap';
import { IoDownloadOutline } from "react-icons/io5";
import { MdClose } from "react-icons/md";


interface IPdfPreviewerModal {
    isShow: boolean,
    onHide: () => void,
    pdfFile: string,
    fileNamePrefix: string,
}

const PdfViewerModal = ({ isShow, onHide, pdfFile, fileNamePrefix }: IPdfPreviewerModal) => {
    const [numPages, setNumPages] = useState<number>();
    const [parentId] = useState(Math.random());

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
    }

    const onPdfDownload = (): void => {
        if (!pdfFile) {
            return;
        }
        const link = document.createElement("a");
        link.href = pdfFile;
        link.download = `${fileNamePrefix}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <Modal
                show={isShow}
                className="pdfPreviewModal"
                backdropClassName="modalBackdrop"
                onHide={onHide}
                size="lg"
                centered
            >
                <Modal.Header className="justify-content-end">
                    <Button className='mainBtn d-flex align-items-center' variant="primary" onClick={() => onPdfDownload()}>
                        {IoDownloadOutline({ size: 18 })}
                        <span className="ms-2">Download</span>
                    </Button>
                    <span className="closeBtn ms-2" onClick={onHide}>{MdClose({})}</span>
                </Modal.Header>
                <Modal.Body>
                    <div className="pdf-viewer-container" id={`parent-div-${parentId}`}>
                        
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default PdfViewerModal;