//!
//! SpryJs Query Module
export function q(selector: string, callback?: Function) {

    const elements = document.querySelectorAll(selector);

    if (callback && elements.length) {
        elements.forEach((elem: Element) => {
            callback(elem);
        })
    }

    return elements;
};