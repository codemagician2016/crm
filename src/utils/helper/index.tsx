
export const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: "33.5px",
      height: "33.5px",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: "33.5px",
      padding: "0 8px",
    }),
    input: (provided: any) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: "33.5px",
    }),
};

export const getAddressObj = (address: any) => {
  let line1: string = '';
  let line2: string = '';

  line1 += `${address?.addressLine1 ? (address?.addressLine1 + ', ') : ''}`;
  line1 += `${address?.addressLine2 ? (address?.addressLine2 + ', ') : ''}`;

  line2 += `${address?.pincode ? (address?.pincode + ', ') : ''}`;
  line2 += `${address?.city ? (address?.city + ', ') : ''}`;
  line2 += `${address?.state ? (address?.state + ', ') : ''}`;
  line2 += `${address?.country ? (address?.country) : ''}`;

  return { line1, line2 };
}

export const DEFAULT_PAGE_ITEMS = 10;

export const getPaginationIndex = (index: number, currentPage: number) => {
  return (((currentPage - 1) * DEFAULT_PAGE_ITEMS) + (index + 1));
}