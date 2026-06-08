class Auth {

    setCookie = (name: string, value: string, expirySec = 1) => {
        let expires = '';
        if (expirySec) {
            const date = new Date();
            date.setTime(date.getTime() + (expirySec * 60 * 60 *  1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (typeof value === 'object' ? JSON.stringify(value) : value) + expires + '; path=/';
    }

    getCookie = (name: string) => {
        const nameEQ = name + '=';
        const cookiesArray = document.cookie.split(';');
        for (let i = 0; i < cookiesArray.length; i++) {
            let cookie = cookiesArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                const cookieValue = cookie.substring(nameEQ.length, cookie.length);
                try {
                    // Try to parse the cookie value as JSON
                    return JSON.parse(cookieValue);
                } catch (error) {
                    // If parsing fails, return the raw cookie value
                    return cookieValue;
                }
            }
        }
        return null;
    }

    deleteCookie = (name: string) => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}

export default Auth;