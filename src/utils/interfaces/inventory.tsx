

export interface IInventoryData {
    _id: string,
    name: string,
    productType: string,
    price: string,
    tax: string,
    sku: string,
    createdAt: Date,
    updatedAt?: Date,
}

export interface AddInventoryData {
    _id?: string,
    name: string,
    productType: string,
    price: string,
    tax: string,
    sku: string,
    isEdit: boolean
}