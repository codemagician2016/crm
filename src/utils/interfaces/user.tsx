import { UserRoles } from "../helper/constants";
import { IOrganization } from "./organization";

export interface IUserData {
    _id?: string,
    name: string,
    password?: string,
    phoneNo: number | undefined,
    email: string,
    role: UserRoles,
    organizationId?: string | null,
    createdAt?: Date,
    updatedAt?: Date,
}

export interface AuthSliceInterface {
    isLoggedIn: boolean,
    isAdmin: boolean,
    userData: IUserData | null,
    organization: IOrganization | null
}

export interface UserModalState {
    isShow: boolean;
    userData: string;
}