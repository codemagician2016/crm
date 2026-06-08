export const invoiceScss = `
.invoice {
    font-family:'Nunito Sans', sans-serif !important;
    font-size: 14px !important;
    font-weight: 400 !important;
    color: #6E6E6E !important;
    line-height: 22px !important;
    overflow-x: hidden !important ;
    -webkit-font-smoothing: antialiased !important;
    // background-color: #dbdbdb !important;
}

body {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #777777;
    // background-color: #f5f7ff;
  }

  .title{
    font-size: 34px;
    font-weight: 600;
  }
  .bgTitle{
    position: absolute;
    rotate: -45deg;
    font-size: 85px;
    opacity: 0.1;
    top: 30%;
    left: 25%;
    right: 0;
  
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: #10375c;
    margin: 0 0 20px 0;
    font-weight: 500;
    line-height: 1.2;
  }

  p {
    margin-top: 0;
    margin-bottom: 15px;
  }

  b, strong {
    font-weight: 600;
  }

  /* Utility Classes */
  .cs-primary_color {
    color: #10375c;
  }

  .cs-text_right {
    text-align: right;
  }

  .cs-mb5 {
    margin-bottom: 5px;
  }

  .cs-mb10 {
    margin-bottom: 10px;
  }

  .cs-mb25 {
    margin-bottom: 25px;
  }

  .cs-m0 {
    margin: 0 !important;
  }

  .cs-f16 {
    font-size: 16px;
  }

  .cs-semi_bold {
    font-weight: 600;
  }

  .cs-bold {
    font-weight: 700;
  }

  /* Invoice Container */
  .cs-container {
    // max-width: 880px;
    padding: 15px 15px;
    // margin-left: auto;
    // margin-right: auto;
  }

  .cs-invoice.cs-style1 {
    background: #fff;
    border-radius: 10px;
    padding: 30px;
    // box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  /* Invoice Header */
  .cs-invoice_head {
    display: flex;
    justify-content: space-between;
  }

  .cs-invoice_head.cs-type1 {
    align-items: flex-start;
    padding-bottom: 25px;
    border-bottom: 1px solid #eaeaea;
  }

  .cs-invoice_left {
    max-width: 55%;
  }

  .cs-invoice_right {
    text-align: right;
  }

  .cs-logo {
    margin-bottom: 21px;
  }

  .cs-logo img {
    max-height: 50px;
  }

  /* Invoice Body */
  .cs-round_border {
    border: 1px solid #eaeaea;
    overflow: hidden;
    border-radius: 6px;
  }

  .cs-table_responsive {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    background: #f6f6f6;
    color: #10375c;
    padding: 10px 15px;
  }

  td {
    padding: 10px 15px;
    border-top: 1px solid #eaeaea;
    font-size: 14px;
  }

  .cs-width_1 {
    width: 8%;
  }

  .cs-width_2 {
    width: 16.66666667%;
  }

  .cs-width_3 {
    width: 25%;
  }

  .cs-width_4 {
    width: 33.33333333%;
  }

  /* Invoice Footer */
  .cs-invoice_footer {
    display: flex;
  }

  .cs-left_footer {
    width: 55%;
    padding: 10px 15px;
  }

  .cs-right_footer {
    width: 46%;
  }

  .cs-border_top {
    border-top: 1px solid #eaeaea;
  }

  /* Note Section */
  .cs-note {
    display: flex;
    align-items: flex-start;
    margin-top: 40px;
  }

  .cs-note_left {
    margin-right: 10px;
    margin-top: 6px;
  }

  .cs-note_left svg {
    width: 32px;
    color:#eb8317;
  }

  /* Buttons */
  .cs-invoice_btns {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  .cs-invoice_btn {
    display: inline-flex;
    align-items: center;
    border: none;
    font-weight: 600;
    padding: 8px 20px;
    cursor: pointer;
  }

  .cs-invoice_btn svg {
    width: 24px;
    margin-right: 5px;
  }

  .cs-invoice_btn.cs-color1 {
    color: #10375c;
    background: rgba(235, 131, 23, 0.15);
  }

  .cs-invoice_btn.cs-color1:hover {
    background-color: rgba(42, 209, 157, 0.3);
  }

  .cs-invoice_btn.cs-color2 {
    color: #fff;
    background: #eb8317;
  }

  .cs-invoice_btn.cs-color2:hover {
    background-color: rgba(42, 209, 157, 0.8);
  }

  /* Responsive */
  @media (max-width: 767px) {
    .cs-invoice.cs-style1 {
      padding: 30px 20px;
    }
    
    .cs-invoice_head {
      flex-direction: column;
    }
    
    .cs-invoice_head.cs-type1 {
      flex-direction: column-reverse;
      align-items: center;
      text-align: center;
    }
    
    .cs-invoice_left, 
    .cs-invoice_right {
      max-width: 100%;
      text-align: center !important;
    }
    
    .cs-invoice_footer {
      flex-direction: column;
    }
    
    .cs-left_footer,
    .cs-right_footer {
      width: 100%;
    }
  }

  @media print {
    .cs-hide_print {
      display: none !important;
    }
    
    body {
      background-color: #ffffff;
    }
  }
`;