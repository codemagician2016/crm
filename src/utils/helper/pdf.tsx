import InvoicePdf from '../../commoncomponent/Pdf/InvoicePdf';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { invoiceScss } from '../../commoncomponent/Pdf/style';

export const generateHtmlCssForPdf = async (pdfData: any, pdfType: string) => {
    let template: React.ReactNode;
    let templateCss;
    if (pdfType === 'invoice') {
        template = ReactDOMServer.renderToStaticMarkup(<InvoicePdf invoiceDetail={pdfData?.invoiceDetail} orgInfo={pdfData?.orgInfo} />);
        templateCss = invoiceScss;
    }
    const htmlString = `
        <html>
            <head>
                <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,800,800i,900i&display=swap" rel="stylesheet">
            </head>
            <body>
                ${template}
            </body>
        </html>
    `;

    const payload = {
        html: htmlString,
        css: templateCss || '',
    }

    return payload;
}