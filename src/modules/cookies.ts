//!
//! SpryJs Cookies Module
export function q(selector: string, callback?: Function) {

    const elements = document.querySelectorAll(selector);

    if (callback && elements.length) {
        elements.forEach((elem: Element) => {
            callback(elem);
        })
    }

    return elements;
};

/**
 * Set a Cookie
 *
 * @param name The cookie name to set
 * @param value The value
 * @param expSeconds Number in seconds to expire
 * 
 * @returns void
 */
export function setCookie(name: string, value: string, expSeconds: number) {
    var expDate = new Date();
    expDate.setTime(expDate.getTime() + expSeconds * 1000);
    var c_value = escape(value) + ((expSeconds == null) ? '' : '; expires=' + expDate.toUTCString());
    document.cookie = name + "=" + c_value + '; path=/';
}

/**
 * Get a Cookie
 *
 * @param name The name of the cookie to get
 * 
 * @returns string
 */
export function getCookie(cname: string) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0)
            {
                return c.substring(name.length, c.length);
            }
    }
    return '';
}


/**
 * Remove a Cookie
 *
 * @param name The cookie name to set
 * 
 * @returns void
 */
export function removeCookie(name: string) {
    setCookie(name, '', -1);
}


