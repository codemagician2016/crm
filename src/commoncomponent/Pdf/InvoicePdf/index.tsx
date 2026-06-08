import React from 'react';
import { logoBase64Url } from '../../../utils/helper/image';
import moment from 'moment';
import { IOrganization } from '@/utils/interfaces/organization';
import { getAddressObj } from '@/utils/helper';
import Image from 'next/image';

interface IInvoicePdf {
  invoiceDetail: any,
  orgInfo: IOrganization,
}

function InvoicePdf({ invoiceDetail, orgInfo }: IInvoicePdf) {
  const invoiceData = invoiceDetail;
  const leadDetail = invoiceDetail?.leadDetail;
  const organizationBillAddress = getAddressObj(orgInfo);


  return (
    <>
      <div className='invoice'>
        <div className="cs-container">
          <div className="cs-invoice cs-style1">
            <div className="cs-invoice_in" id="download_section">
              <div className="cs-invoice_head cs-type1 cs-mb25">
                <div className="cs-invoice_left">
                  <h2 className='title'>Invoice</h2>
                  <h2 className='bgTitle'>Invoice</h2>
                  <p className="cs-invoice_number cs-primary_color cs-mb5 cs-f16"><b className="cs-primary_color">Invoice No:</b> {invoiceData?.invoiceId}</p>
                  <p className="cs-invoice_date cs-primary_color cs-m0"><b className="cs-primary_color">Issue Date: </b>{moment(invoiceData?.createdAt)?.format('DD/MM/YYYY')}</p>
                  
                </div>
                <div className="cs-invoice_right cs-text_right">
                  <div className="cs-logo cs-mb5"><Image className='' src={logoBase64Url} alt="Logo" width={220} height={50} /></div>
                </div>
              </div>
              <div className="cs-invoice_head cs-mb10">
                <div className="cs-invoice_left">
                  <b className="cs-primary_color">Invoice To:</b>
                  <p>
                    {leadDetail?.name || ''} <br />
                    {
                        leadDetail?.email && (
                            <>
                            <span>{`Email - ${leadDetail?.email}`}</span>
                            <br />
                            </>
                        )
                    }
                    {
                        leadDetail?.phoneNo && (
                            <>
                            <span>{`Phone No - ${leadDetail?.phoneNo}`}</span>
                            <br />
                            </>
                        )
                    }
                  </p>
                </div>
                <div className="cs-invoice_right cs-text_right">
                  <b className="cs-primary_color">Pay To:</b>
                  <p>
                    {orgInfo?.name} <br />
                    {organizationBillAddress?.line1 || ''}<br />
                    {organizationBillAddress?.line2 || ''}
                  </p>
                </div>
              </div>
              <div className="cs-table cs-style1">
                <div className="cs-round_border">
                  <div className="cs-table_responsive">
                    <table>
                      <thead>
                        <tr>
                          <th className="cs-width_3 cs-semi_bold cs-primary_color cs-focus_bg">Item</th>
                          <th className="cs-width_1 cs-semi_bold cs-primary_color cs-focus_bg">Qty</th>
                          <th className="cs-width_1 cs-semi_bold cs-primary_color cs-focus_bg">Price</th>
                          <th className="cs-width_1 cs-semi_bold cs-primary_color cs-focus_bg cs-text_right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        
                            <tr key={`invoice-pdf-item`}>
                              <td className="cs-width_3">{invoiceData?.inventoryName || ''}</td>
                              <td className="cs-width_1">1</td>
                              <td className="cs-width_1">{`$ ${invoiceData?.amount || 0}`}</td>
                              <td className="cs-width_1 cs-text_right">{`$ ${invoiceData?.amount || 0}`}</td>
                            </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="cs-invoice_footer cs-border_top">
                    <div className="cs-left_footer cs-mobile_hide">
                      
                    </div>
                    <div className="cs-right_footer">
                      <table>
                        <tbody>
                          <tr className="cs-border_left">
                            <td className="cs-width_3 cs-semi_bold cs-primary_color cs-focus_bg">Total Amount</td>
                            <td className="cs-width_3 cs-semi_bold cs-focus_bg cs-primary_color cs-text_right">{`$ ${invoiceData?.amount || 0}`}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cs-note">
                
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  )
}

export default InvoicePdf