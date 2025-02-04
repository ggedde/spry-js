//!
//! SpryJs Cookies Module

export const cookie = {
    /**
     * Set a Cookie
     *
     * @param cookieName    string - The cookie name to set
     * @param cookieValue   any    - The value
     * @param expireSeconds number - Number in seconds to expire. 0 = Session expire.
     * 
     * @returns void
     */
    set: function (cookieName: string, cookieValue: any, expireSeconds?: number) {
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
     * @returns string
     */
    get: function (cookieName: string) {
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
    remove: function (cookieName: string) {
        this.set(cookieName, '', -1);
    }
}
