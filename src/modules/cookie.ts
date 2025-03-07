//!
//! SpryJs Cookies Module

export type SpryJsCookie = {
    set(cookieName: string, cookieValue: any, expireSeconds?: number): void;
    get(cookieName: string): any;
    remove(cookieName: string): void;
};

const cookie: SpryJsCookie = {
    /**
     * Set a Cookie
     *
     * @param cookieName    string - The cookie name to set
     * @param cookieValue   any    - The value. Value will be JSON parsed and URI encoded.
     * @param expireSeconds number - Number in seconds to expire. 0 = Session expire.
     * 
     * @returns void
     */
    set: function (cookieName: string, cookieValue: any, expireSeconds?: number): void {
        let expires = '';
        if (expireSeconds && expireSeconds !== 0) {
            const expDate = new Date();
            expDate.setTime(expDate.getTime() + expireSeconds * 1000);
            expires = 'expires=' + expDate.toUTCString();
        }
        document.cookie = encodeURIComponent(cookieName) + "=" + encodeURIComponent(JSON.stringify(cookieValue)) + ';' + expires;
    },

    /**
     * Get a Cookie
     *
     * @param cookieName string - The name of the cookie to get
     * 
     * @returns string | number | object | boolean
     */
    get: function (cookieName: string): any {
        const cookieArr = document.cookie.split(";");
        for (var i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].split("=");

            if (cookieName === cookiePair[0].trim()) {
                return JSON.parse(decodeURIComponent(cookiePair[1]));
            }
        }
        return '';
    },

    /**
     * Remove a Cookie
     *
     * @param cookieName string - The cookie name to remove
     * 
     * @returns void
     */
    remove: function (cookieName: string): void {
        this.set(cookieName, '', -1);
    }
}

export default cookie;
