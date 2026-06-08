export interface IOrganization {
    name:string,
    url:string,
    _id:string,
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    gst: string;
    phoneNo: string;
}

export interface IAddOrganization {
    name: string,
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    gst: string;
    phoneNo: string;
}

export interface IUpdateOrganization {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    gst: string;
    phoneNo: string;
}