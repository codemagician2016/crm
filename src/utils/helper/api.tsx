import axios from 'axios';
import { getCookie } from 'cookies-next';

class Api {
    private baseUrl: string | undefined;
    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    getDefaultHeaders = async (requested_headers = {}) => {
        const organizationId = getCookie('organizationId');
        const headers = {
            ...requested_headers,
            organizationId,
        }
        return headers;
    }

    async post(url: string, data = {}, headers = {}) {
        try {
            const reqHeaders: any = await this.getDefaultHeaders(headers);
            url = `${this.baseUrl}${url}`;
            return await axios.post(url, data, { headers: reqHeaders });
        } catch (e) {
            console.log(e)
            throw e;
        }

    }

    async patch(url: string, data = {}, headers = {}) {
        try {
            const reqHeaders: any = await this.getDefaultHeaders(headers);
            url = `${this.baseUrl}${url}`;
            return await axios.post(url, data, {  headers: reqHeaders });
        } catch (e) {
            console.log(e)
            throw e;
        }
    }

    async delete(url: string, params = {}, headers = {}) {
        try {
            const reqHeaders: any = await this.getDefaultHeaders(headers);
            url = `${this.baseUrl}${url}`;
            return await axios.delete(url, { params,  headers: reqHeaders });
        } catch (e) {
            console.log(e)
            throw e;
        }
    }

    async get(url: string, params = {}, headers = {}) {
        try {
            const reqHeaders: any = await this.getDefaultHeaders(headers);
            url = `${this.baseUrl}${url}`;
            return await axios.get(url, { params,  headers: reqHeaders });
        } catch (e) {
            console.log(e)
            throw e;
        }
    }

    async put(url: string, data = {}, params = {}, headers = {}) {
        try {
            const reqHeaders: any = await this.getDefaultHeaders(headers);
            url = `${this.baseUrl}${url}`;
            return await axios.put(url, data, { params, headers: reqHeaders });
        } catch (e) {
            console.log(e)
            throw e;
        }
    }
}

export default Api;