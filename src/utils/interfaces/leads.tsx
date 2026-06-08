import { ProductTypes } from "../helper/constants";
import { ISortOption } from "./common";
import { IUpdatePayment } from "./payment";

export interface AddLead {
    _id?: string, 
    name: string,
    businessName: string,
    phoneNo: string | null,
    email: string,
    source: string,
    service: string,
    assignToId: string,
    stage: string,
    followUpDate: Date | null,
    comment: string,
    isEdit: boolean,
    createdAt?: Date
}

export interface ILeadFilter {
    page: number,
    sort: ISortOption | null,
    search: string,
    followup_start_date: Date | null,
    followup_end_date: Date | null,
    leadStatus: any[],
    owner: any[],
}

export interface IUpdateLead {
    _id?: string, 
    name: string,
    phoneNo: string,
    email: string,
    amount: string,
    currency: string,
    selected_source: any,
    productType: ProductTypes,
    followUpDate: Date | null,
    description: string,
    serviceId: string | null,
    ownerId: string | null,
    selected_status: any,
    closing_amount: string,
    selected_lost_reason: any,
    payment_details: IUpdatePayment,
}