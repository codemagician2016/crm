import { ISortOption } from "./common";

export interface IInvoiceFilter {
    page: number,
    sort: ISortOption | null,
    search: string,
    transaction_start_date: Date | null,
    transaction_end_date: Date | null,
}