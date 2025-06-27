//!
//! SpryJs Query Module

export type SpryJsQueryCollection = {
    selector: string | Element | Element[],
    elements: Element[];
    el: Element | null;
    each(callbackFn: Function): SpryJsQueryCollection;
    toggleClass(className: string|string[], force?: boolean): SpryJsQueryCollection;
    addClass(className: string|string[]): SpryJsQueryCollection;
    hasClass(className: string|string[]): boolean;
    removeClass(className: string|string[]): SpryJsQueryCollection;
    toggleAttr(attributeName: string|string[], force?: boolean): SpryJsQueryCollection;
    attr(attributeName: string, attributeValue: string): SpryJsQueryCollection;
    removeAttr(attributeName: string|string[]): SpryJsQueryCollection;
    on(type: string, listener: (el: Element, index: number, event: Event) => void, options?: AddEventListenerOptions): SpryJsQueryCollection;
    off(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): SpryJsQueryCollection;
    index(i?: number): SpryJsQueryCollection;
    nth(n?: number): SpryJsQueryCollection;
    first(): SpryJsQueryCollection;
    last(): SpryJsQueryCollection;
    slice(start: number, end?: number): SpryJsQueryCollection;
    filter(callbackFn: Function, thisArg?: object): SpryJsQueryCollection;
}

/**
 * Query Elements
 *
 * @param selector     string | Element | Element[] - Selector String, Element or array of Elements.
 * @param findSelector string                       - Selector String to capture elements within Collection Elements.
 *
 * @var selector string | Element | Element[] - The Current Selector Used.
 * @var elements Elements[]                   - Queried elements.
 * @var el       Element                      - First Queried element.
 * 
 * @method toggleClass function(className: string|string[], force?: boolean)
 * Toggles Class of each element in query
 * 
 * @method addClass function(className: string|string[])
 * Adds Class to each element in query
 * 
 * @method hasClass function(className: string|string[])
 * Returns boolean if the element has the class
 * 
 * @method removeClass function(className: string|string[])
 * Removes Class of each element in query
 * 
 * @method toggleAttr function(attributeName: string|string[], force?: boolean)
 * Toggles Attribute of each element in query
 * 
 * @method attr function(attributeName: string, attributeValue: string)
 * Sets Attribute to each element in query
 * 
 * @method removeAttr function(attributeName: string|string[])
 * Removes Attribute of each element in query
 * 
 * @method on function(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions)
 * Adds Event Listener to each element in query
 * 
 * @method off function(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions)
 * Removed Event Listener from each element in query
 *
 * @method each function(callbackFn: Function)
 * Loops through each element found in query
 * 
 * @method index function(i: number)
 * Resets the collection to a single element by index.
 * 
 * @method nth function(n: number)
 * Resets the collection to a single element by nth selector.
 * 
 * @method first function()
 * Resets the collection to the first element.
 * 
 * @method last function()
 * Resets the collection to the last element.
 * 
 * @method slice function(start: number, end?: number)
 * Resets the collection to a range by index.
 * 
 * @method filter function(callbackFn: Function, thisArg?: object)
 * Resets the collection to a filtered set.
 *
 * @returns SpryJsQueryCollection
 */
export function query(selector: string | Element | Element[], findSelector?: string): SpryJsQueryCollection {
    
    let selectorElements = [];
    let elements = [];
    if (typeof selector === 'string') {
        selectorElements = selector ? Array.from(document.querySelectorAll(selector)) : [];
    } else if (Array.isArray(selector)) {
        selectorElements = selector;
    } else {
        selectorElements = [selector];
    }

    if (findSelector && selectorElements) {
        for (let s = 0; s < selectorElements.length; s++) {
            const els = selectorElements[s].querySelectorAll(findSelector);
            for (let e = 0; e < els.length; e++) {
                elements.push(els[e]);
            }
        }
    } else {
        elements = selectorElements;
    }

    // const els = selector ? Array.from(fromElement.querySelectorAll(selector)) : [];
    const el = elements ? elements[0] : null;

    return {
        selector: selector,
        elements: elements,
        el: el,

        /**
         * Loop through each element in the collection
         *
         * @param callbackFn Function - Callback function to apply to each element in the Collection.
         * 
         * @returns SpryJsQueryCollection
         */
        each: function (callbackFn: Function): SpryJsQueryCollection {
            if (!this.selector) {
                console.warn('SpryJS - Missing `selector` for query action.');
            }
            this.elements.forEach((el: Element, index: number) => {
                callbackFn(el, index);
            });
            return this;
        },

        /**
         * Toggle Class(s) on elements in collection
         *
         * @param className string | string[] - Class names to toggle.
         * @param force boolean               - Force true to add class or false to remove class. Undefined will check to determine toggle state.
         * 
         * @returns SpryJsQueryCollection
         */
        toggleClass: function (className: string | string[], force?: boolean): SpryJsQueryCollection {
            return this.each((el: Element) => {
                if (typeof className === 'string') className = className.split(' ');
                for (let i = 0; i < className.length; i++) {
                    el.classList.toggle(className[i], force);
                }
            });
        },

        /**
         * Add Class(s) on elements in collection
         *
         * @param className string | string[] - Class names to Add.
         * 
         * @returns SpryJsQueryCollection
         */
        addClass: function (className: string | string[]): SpryJsQueryCollection {
            return this.each((el: Element) => {
                if (typeof className === 'string') className = className.split(' ');
                el.classList.add(...className);
            });
        },

        /**
         * Check if Element(s) have Class(es). All need to be true. Otherwise false.
         *
         * @param className string | string[] - Class names to Add.
         * 
         * @returns boolean
         */
        hasClass: function (className: string | string[]): boolean {
            let hasClass = this.elements.length ? true : false;
            this.each((el: Element) => {
                if (typeof className === 'string') className = className.split(' ');
                for (let c = 0; c < className.length; c++) {
                    if (!el.classList.contains(className[c])) {
                        hasClass = false;
                    }
                }
            });

            return hasClass;
        },

        /**
         * Remove Class(s) from elements in collection
         *
         * @param className string | string[] - Class names to Remove.
         * 
         * @returns SpryJsQueryCollection
         */
        removeClass: function (className: string | string[]): SpryJsQueryCollection {
            return this.each((el: Element) => {
                if (typeof className === 'string') className = className.split(' ');
                el.classList.remove(...className);
            });
        },

        /**
         * Toggle Attribute(s) on elements in collection
         *
         * @param attributeName string | string[] - Attribute names to toggle.
         * @param force boolean                   - Force true to add Attribute or false to remove Attribute. Undefined will check to determine toggle state.
         * 
         * @returns SpryJsQueryCollection
         */
        toggleAttr: function (attributeName: string | string[], force?: boolean): SpryJsQueryCollection {
            return this.each((el: Element) => {
                if (typeof attributeName === 'string') attributeName = attributeName.split(' ');
                for (let i = 0; i < attributeName.length; i++) {
                    el.toggleAttribute(attributeName[i], force);
                }
            });
        },

        /**
         * Set the Attribute name and value on elements in collection
         *
         * @param attributeName  string - Attribute name to Set.
         * @param attributeValue string - Attribute value to Set. If empty it will default to a blank string ""
         * 
         * @returns SpryJsQueryCollection
         */
        attr: function (attributeName: string, attributeValue?: string): SpryJsQueryCollection {
            if (!attributeValue) {
                attributeValue = '';
            }
            return this.each((el: Element) => {
                el.setAttribute(attributeName, attributeValue);
            });
        },

        /**
         * Remove Attribute(s) from elements in collection
         *
         * @param attributeName string | string[] - Attribute names to Remove.
         * 
         * @returns SpryJsQueryCollection
         */
        removeAttr: function (attributeName: string | string[]): SpryJsQueryCollection {
            return this.each((el: Element) => {
                if (typeof attributeName === 'string') attributeName = attributeName.split(' ');
                for (let i = 0; i < attributeName.length; i++) {
                    el.removeAttribute(attributeName[i]);
                }
            });
        },

        /**
         * Add an event listener to all elements within the collection
         *
         * @param type string
         * Event Type to listen for.
         * 
         * @param listener EventListenerOrEventListenerObject
         * Callback function to apply on event.
         * 
         * @param options boolean | AddEventListenerOptions
         * Additional Event Listener Options.
         * 
         * @returns SpryJsQueryCollection
         * 
         * See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
         */
        on: function (type: string, listener: (el: Element, index: number, event: Event) => void, options?: AddEventListenerOptions): SpryJsQueryCollection {
            return this.each((el: Element, index: number) => {
                el.addEventListener(type, (event: Event) => {
                    listener(el, index, event);
                }, options);
            });
        },

        /**
         * Remove an event listener on all elements within the collection
         *
         * @param type string
         * Event Type to Remove.
         * 
         * @param listener EventListenerOrEventListenerObject
         * Callback function to Remove on event.
         * 
         * @param options boolean | AddEventListenerOptions
         * Additional Event Listener Options.
         * 
         * @returns SpryJsQueryCollection
         *
         * See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
         */
        off: function (type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): SpryJsQueryCollection {
            return this.each((el: Element) => {
                el.removeEventListener(type, listener, options);
            });
        },

        /**
         * Resets the collection to a single element by index.
         *
         * @param i number - Index of element. Does not allow for negative numbers
         * # Warning - If index does not exits then elements in collection will be truncated.
         * 
         * @returns SpryJsQueryCollection
         */
        index: function (i: number): SpryJsQueryCollection {
            if (this.elements[i]) {
                this.elements = [this.elements[i]];
            } else {
                this.elements = [];
            }
            return this;
        },

        /**
         * Resets the collection to a single element by nth selector.
         *
         * @param n number - Nth Selector. This is index + 1. So first item would be 1 not 0.
         * # Warning - If index does not exits then elements in collection will be truncated.
         * 
         * @returns SpryJsQueryCollection
         */
        nth: function (n?: number): SpryJsQueryCollection {
            const index = (n ? (n < 0 ? (this.elements.length + n) : n - 1 ) : 0);
            return this.index(index);
        },

        /**
         * Resets the collection to the first element in Collection.
         * Alias of nth(1)
         * 
         * @returns SpryJsQueryCollection
         */
        first: function (): SpryJsQueryCollection {
            return this.nth(1);
        },

        /**
         * Resets the collection to the last element in Collection.
         * Alias of nth(-1)
         * 
         * @returns SpryJsQueryCollection
         */
        last: function (): SpryJsQueryCollection {
            return this.nth(-1);
        },

        /**
         * Resets the collection to a range by index.
         * Both parameters can use Negative numbers to indicate an offset from the end
         *
         * @param start number - Start index of Range.
         * @param end   number - End index of range.
         * 
         * @returns SpryJsQueryCollection
         */
        slice: function (start: number, end?: number): SpryJsQueryCollection {
            this.elements = this.elements.slice(start, end);
            return this;
        },

        /**
         * Resets the collection to a filtered set.
         * Both parameters can use Negative numbers to indicate an offset from the end
         *
         * @param callbackFn (value: Element, index: number, array: Element[]) => boolean
         * Callback Function to check collection against. Must return boolean.
         * 
         * @param args object - A value to use as this when executing callbackFn.
         * 
         * @returns SpryJsQueryCollection
         * 
         * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
         */
        filter: function (callbackFn: (value: Element, index: number, array: Element[]) => boolean, thisArg?: object): SpryJsQueryCollection {
            this.elements = this.elements.filter(callbackFn, thisArg);
            return this;
        },
    }
};