//!
//! SpryJs Query Module

type SpryJsQueryCollection = {
    elements: Element[];
    each(callback: Function): SpryJsQueryCollection;
    toggleClass(className: string, force?: boolean): SpryJsQueryCollection;
    addClass(className: string): SpryJsQueryCollection;
    removeClass(className: string): SpryJsQueryCollection;
    toggleAttr(attributeName: string, force?: boolean): SpryJsQueryCollection;
    attr(attributeName: string, attributeValue: string): SpryJsQueryCollection;
    removeAttr(attributeName: string): SpryJsQueryCollection;
    on(action: string, callback: Function, options?: AddEventListenerOptions): SpryJsQueryCollection;
    off(action: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): SpryJsQueryCollection;
    slice(start: number, end?: number): SpryJsQueryCollection;
    nth(n?: number): SpryJsQueryCollection;
    first(): SpryJsQueryCollection;
    last(): SpryJsQueryCollection;
}

/**
 * Query Elements
 *
 * @param selector string   - Selector String.
 *
 * @var elements array - Queried elements.
 *
 * @method each function(callback: Function)                            - Loops through each element found in query
 * @method toggleClass function(className: string, force?: boolean)     - Toggles Class of each element in query
 * @method addClass function(className: string)                         - Adds Class to each element in query
 * @method removeClass function(className: string)                      - Removes Class of each element in query
 * @method toggleAttr function(attributeName: string, force?: boolean)  - Toggles Attribute of each element in query
 * @method attr function(attributeName: string, attributeValue: string) - Sets Attribute to each element in query
 * @method removeAttr function(attributeName: string)                   - Removes Attribute of each element in query
 * @method on function(action: string, callback: Function)              - Adds Event Listener to each element in query
 *
 * @returns object
 */
export function query(selector: string): SpryJsQueryCollection {

    return {
        elements: Array.from(document.querySelectorAll(selector)),
        each: function (callback: Function): SpryJsQueryCollection {
            this.elements.forEach((elem: Element, index: number) => {
                callback(elem, index);
            });
            return this;
        },

        toggleClass: function (className: string, force?: boolean): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.classList.toggle(className, force);
            });
        },

        addClass: function (className: string): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.classList.add(className);
            });
        },

        removeClass: function (className: string): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.classList.remove(className);
            });
        },

        toggleAttr: function (attributeName: string, force?: boolean): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.toggleAttribute(attributeName, force);
            });
        },

        attr: function (attributeName: string, attributeValue: string): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.setAttribute(attributeName, attributeValue);
            });
        },

        removeAttr: function (attributeName: string): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.removeAttribute(attributeName);
            });
        },

        on: function (action: string, callback: Function, options?: AddEventListenerOptions): SpryJsQueryCollection {
            return this.each((elem: Element, index: number) => {
                elem.addEventListener(action, (event: Event) => {
                    callback(elem, index, event);
                }, options);
            });
        },

        off: function (action: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): SpryJsQueryCollection {
            return this.each((elem: Element) => {
                elem.removeEventListener(action, listener, options);
            });
        },

        slice: function (start: number, end?: number): SpryJsQueryCollection {
            this.elements = this.elements.slice(start, end);
            return this;
        },

        nth: function (n?: number): SpryJsQueryCollection {
            this.elements = [this.elements[(n ? (n < 0 ? (this.elements.length + n) : n - 1 ) : 0)]];
            return this;
        },

        first: function (): SpryJsQueryCollection {
            return this.nth(1);
        },

        last: function (): SpryJsQueryCollection {
            return this.nth(-1);
        },
    }
};