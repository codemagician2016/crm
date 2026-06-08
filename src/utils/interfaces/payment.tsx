import { ISortOption } from "./common";


export interface IPaymentFilter {
    page: number,
    sort: ISortOption | null,
    search: string,
    due_start_date: Date | null,
    due_end_date: Date | null,
    paymentStatus: any[],
    owner: any[],
}

export interface IUpdatePayment {
    transaction_date: Date | null,
    due_date: Date | null,
    payment_method: string,
    closing_amount: string
    amount: string
    currency: string
    description: string,
}