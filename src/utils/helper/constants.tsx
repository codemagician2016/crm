import { ISortOption } from "../interfaces/common";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const s3BucketBaseUrl = process.env.NEXT_PUBLIC_AWS_S3_URL;

export enum UserRoles {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    MANAGER = 'manager',
    SALESREP = 'sales_person',
}


export const userRoleOptions: ISelectOption[] = [
    {
        label: 'Super Admin',
        value: UserRoles.SUPER_ADMIN
    },
    {
        label: 'Admin',
        value: UserRoles.ADMIN
    },
    {
        label: 'Manager',
        value: UserRoles.MANAGER
    },
    {
        label: 'Sales Person',
        value: UserRoles.SALESREP
    }
]

export const productTypeOptions: ISelectOption[] = [
    {
        value: 'service', label: 'Service'
    },
    {
        value: 'product', label: 'Product'
    }
]

export enum ProductTypes {
    Service = 'service',
    Product = 'product',
}

export const currencyOptions: ISelectOption[] = [
    { value: "GBP", label: "Pound Sterling (£)" },
    { value: "USD", label: "United States Dollar ($)" },
    { value: "NZD", label: "New Zealand Dollar ($)" },
    { value: "AUD", label: "Australian Dollar ($)" },
    { value: "CAD", label: "Canadian Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "AED", label: "United Arab Emirates Dirham (AED)" },
    { value: "INR", label: "Indian Rupee (₹)" }
];

export const leadSourceOptions: ISelectOption[]  = [
    { value: "Phone Call", label: "Phone Call" },
    { value: "Social Media", label: "Social Media" },
    { value: "Web Analytics", label: "Web Analytics" },
    { value: "Previous Purchase", label: "Previous Purchase" },
    { value: "Referral sites", label: "Referral sites" }
];

export enum LeadStatuses {
    NEW = 'new',
    OPEN = 'open',
    CLOSE = 'close',
    LOST = 'lost',
}

export const leadStatusOptions: ISelectOption[]  = [
    { value: "new", label: "New" },
    { value: "open", label: "Open" },
    { value: "close", label: "Close" },
    { value: "lost", label: "Lost" },
];

export const paymentMethodOptions: ISelectOption[]  = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "Paypal", label: "Paypal" },
    { value: "Debit Card", label: "Debit Card" },
];

export const leadSortOptions: ISortOption[]  = [
    { label: "Created Date - Desc", sort_field: "createdAt", sort_order: 'desc' },
    { label: "Created Date - Asc", sort_field: "createdAt", sort_order: 'asc' },
    { label: "Followup Date - Desc", sort_field: "followUpDate", sort_order: 'desc' },
    { label: "Followup Date - Asc", sort_field: "followUpDate", sort_order: 'asc' },
    { label: "Name - Desc", sort_field: "name", sort_order: 'desc' },
    { label: "Name - Asc", sort_field: "name", sort_order: 'asc' },
];

export const paymentSortOptions: ISortOption[]  = [
    { label: "Created Date - Desc", sort_field: "createdAt", sort_order: 'desc' },
    { label: "Created Date - Asc", sort_field: "createdAt", sort_order: 'asc' },
    { label: "Due Date - Desc", sort_field: "due_date", sort_order: 'desc' },
    { label: "Due Date - Asc", sort_field: "due_date", sort_order: 'asc' },
    { label: "Name - Desc", sort_field: "name", sort_order: 'desc' },
    { label: "Name - Asc", sort_field: "name", sort_order: 'asc' },
];

export const invoiceSortOptions: ISortOption[]  = [
    { label: "Created Date - Desc", sort_field: "createdAt", sort_order: 'desc' },
    { label: "Created Date - Asc", sort_field: "createdAt", sort_order: 'asc' },
    { label: "Payment Date - Desc", sort_field: "transaction_date", sort_order: 'desc' },
    { label: "Payment Date - Asc", sort_field: "transaction_date", sort_order: 'asc' },
    { label: "Name - Desc", sort_field: "name", sort_order: 'desc' },
    { label: "Name - Asc", sort_field: "name", sort_order: 'asc' },
];

export const paymentStatusOptions: ISelectOption[]  = [
    { value: "partially_paid", label: "Partially Paid" },
    { value: "paid", label: "Paid" },
];


export const sourceStatusOptions: ISelectOption[]  = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const lostReasonStatusOptions: ISelectOption[]  = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const contactStatusOptions: ISelectOption[]  = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];