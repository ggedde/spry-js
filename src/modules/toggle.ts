//!
//! SpryJs Toggles Module

declare global {
    interface Window {
        spryJsTogglers: SpryJsToggler[];
        spryJsToggleWindowListener: boolean;
    }
    interface Element {
        spryJsToggleLoaded: boolean;
    }
}

type SpryJsToggler = {
    el: Element;
    toggleSelector: string | null;
    openSelector: string | null;
    closeSelector: string | null;
    dismissible: boolean;
    escapable: boolean;
    timeout: number;
    timer: Timer | null;
}

export type SpryJsToggleOptions = {
    items?: Element[] | string;
    classOpen?: string;
    classActive?: string;
    dataToggleAttribute?: string;
    dataToggleCloseAttribute?: string;
    dataToggleOpenAttribute?: string;
    dataToggleEscapableAttribute?: string;
    dataToggleDismissibleAttribute?: string;
    dataToggleTimeoutAttribute?: string;
}

export function toggle({
    items = '[data-toggle], [data-toggle-close]',
    classOpen = 'open',
    classActive = 'active',
    dataToggleAttribute = 'data-toggle',
    dataToggleCloseAttribute = 'data-toggle-close',
    dataToggleOpenAttribute = 'data-toggle-open',
    dataToggleEscapableAttribute = 'data-toggle-escapable',
    dataToggleDismissibleAttribute = 'data-toggle-dismissible',
    dataToggleTimeoutAttribute = 'data-toggle-timeout',
}: SpryJsToggleOptions = {}) {

    /**
     * Get the Element
     * 
     * @param string|object toggleObjectOrEvent - Can be an Dom Element or a Selector.
     * @param Element|null  fromElement         - Element to start selector from.
     * 
     * @returns void
     */
    const getElements = function(item: Element | KeyboardEvent | Event | string, fromElement?: Element): Element[] {

        let from: Element | null = null;
        let fromSetId = false;

        // Self
        if (!item && fromElement) {
            return [fromElement];
        }

        // Element
        if (item && item instanceof Element) {
            return [item];
        }

        // Selector
        if (typeof item === 'string') {
            if ((item === 'next' || item === 'hover') && fromElement && fromElement.nextElementSibling) {
                return [fromElement.nextElementSibling];
            }

            if (item === 'prev' && fromElement && fromElement.previousElementSibling) {
                return [fromElement.previousElementSibling];
            }
            if (fromElement && fromElement.parentElement && item.indexOf('{n}') > -1) {
                var selectorIndex = Array.from(fromElement.parentElement.children).indexOf(fromElement);
                item = item.replaceAll('{n}', (selectorIndex + 1).toString());
            }
            if (fromElement && item.indexOf('{') > -1 && item.indexOf('}') > 0) {
                from = fromElement.closest(item.substring(item.indexOf('{')+1, item.indexOf('}')));
                if (from) {
                    let fromId = '';
                    if (from.hasAttribute('id')) {
                        fromId = from.getAttribute('id') || '';
                    } else {
                        fromId = 'id-'+(Math.random() + 1).toString(36).substring(2);
                        from.setAttribute('id', fromId);
                        fromSetId = true;
                    }
                    item = '#'+fromId + item.substring(item.indexOf('}')+1);
                }
            }
            var elements = document.querySelectorAll(item);

            if (from && fromSetId) {
                from.removeAttribute('id');
            }
            
            if (elements) {
                return Array.from(elements);
            }
        }

        return [];
    }

    /**
     * Toggles an element Open or Closed.
     * This will also update all Togglers that are linked to the toggle element.
     * 
     * @param string|object toggleObjectOrEvent - Can be an Dom Element or a Selector.
     * @param string        forceAction         - Can be 'open', 'close', 'toggle'. Default is 'toggle'.
     * 
     * @returns void
     */
    const toggleItem = function(elem: Element, forceAction?: string, event?: Event) {

        let opened = false;
        let elementData: Element[] = [];
        const togglersCount = window.spryJsTogglers.length;

        // Update all Event Togglers and Toggle Elements
        for (let i = 0; i < togglersCount; i++) {
            if (window.spryJsTogglers[i].el && elem === window.spryJsTogglers[i].el) {

                if (window.spryJsTogglers[i].timer) {
                    clearTimeout((window.spryJsTogglers[i].timer as Timer));
                }

                if (window.spryJsTogglers[i].closeSelector === '') {
                    if (window.spryJsTogglers[i].el.classList.contains(classOpen)) {
                        if (event && event.target === window.spryJsTogglers[i].el) {
                            window.spryJsTogglers[i].el.classList.remove(classOpen);
                            window.spryJsTogglers[i].el.setAttribute('aria-expanded', 'false');
                            elementData.push(window.spryJsTogglers[i].el);
                            opened = false;
                        }
                    } else {
                        var closestOpen = window.spryJsTogglers[i].el.closest('.'+classOpen);
                        if (closestOpen) {
                            closestOpen.classList.remove(classOpen);
                            closestOpen.setAttribute('aria-expanded', 'false');
                            elementData.push(closestOpen);
                            opened = false;
                        }
                    }
                }

                if (window.spryJsTogglers[i].closeSelector) {
                    getElements((window.spryJsTogglers[i].closeSelector as string), elem).forEach(closeElement => {
                        closeElement.classList.remove(classOpen);
                        closeElement.setAttribute('aria-expanded', 'false');
                        elementData.push(closeElement);
                        opened = false;
                    });
                }

                if (window.spryJsTogglers[i].toggleSelector && (!forceAction || forceAction === 'toggle')) {
                    getElements((window.spryJsTogglers[i].toggleSelector as string), elem).forEach(toggleElement => {
                        toggleElement.classList.toggle(classOpen);
                        opened = toggleElement.classList.contains(classOpen) ? true : false;
                        if (opened) {
                            toggleElement.setAttribute('aria-expanded', 'true');
                        } else {
                            toggleElement.setAttribute('aria-expanded', 'false');
                        }
                        
                        elementData.push(toggleElement);
                    });
                }

                if (window.spryJsTogglers[i].openSelector && (!forceAction || forceAction === 'open')) {
                    getElements((window.spryJsTogglers[i].openSelector as string), elem).forEach(openElement => {
                        openElement.classList.add(classOpen);
                        openElement.setAttribute('aria-expanded', 'true');
                        elementData.push(openElement);
                        opened = true;
                    });
                }

                window.spryJsTogglers[i].el.toggleAttribute('aria-pressed', opened);
                window.spryJsTogglers[i].el.classList.toggle(classActive, opened);

                if (opened && window.spryJsTogglers[i].timeout && window.spryJsTogglers[i].timeout > 0) {
                    window.spryJsTogglers[i].timer = setTimeout(() => {
                        if (window.spryJsTogglers[i].toggleSelector) {
                            toggleItem(window.spryJsTogglers[i].el);
                        }
                    }, window.spryJsTogglers[i].timeout);
                }
            }
        }

        // Update all corresponding Togglers
        for (let i = 0; i < togglersCount; i++) {
            if (window.spryJsTogglers[i].closeSelector) {
                getElements((window.spryJsTogglers[i].closeSelector as string), window.spryJsTogglers[i].el).forEach(closeElement => {
                    elementData.forEach(element => {
                        if (element === closeElement) {
                            window.spryJsTogglers[i].el.toggleAttribute('aria-pressed', false);
                            window.spryJsTogglers[i].el.classList.toggle(classActive, false);
                        }
                    });
                });
            }

            if (window.spryJsTogglers[i].toggleSelector) {
                getElements((window.spryJsTogglers[i].toggleSelector as string), window.spryJsTogglers[i].el).forEach(toggleElement => {
                    elementData.forEach(element => {
                        if (element === toggleElement) {
                            opened = toggleElement.classList.contains(classOpen) ? true : false;
                            window.spryJsTogglers[i].el.toggleAttribute('aria-pressed', opened);
                            window.spryJsTogglers[i].el.classList.toggle(classActive, opened);
                        }
                    });
                });
            }

            if (window.spryJsTogglers[i].openSelector) {
                getElements((window.spryJsTogglers[i].openSelector as string), window.spryJsTogglers[i].el).forEach(openElement => {
                    elementData.forEach(element => {
                        if (element === openElement) {
                            window.spryJsTogglers[i].el.toggleAttribute('aria-pressed', true);
                            window.spryJsTogglers[i].el.classList.toggle(classActive, true);
                        }
                    });
                });
            }
        }
    }

    /**
     * Checks and Loads the Toggles on the Page and Adds the Event listeners to the Togglers.
     * This can be loaded as many times as need as it does not add duplicate toggles or event listeners.
     * 
     * @returns void
     */
    const closeAllToggles = function(event: Event | KeyboardEvent) {
        var eventTarget: HTMLElement | null = event && event.target instanceof HTMLElement ? event.target : null;
        var targetTag: string | null = eventTarget && eventTarget.tagName ? eventTarget.tagName : null;
        var docTarget: HTMLElement | null = eventTarget && event.type === 'click' ? eventTarget : null;
        var escPressed = event && event.type && event.type === 'keyup' && event instanceof KeyboardEvent && event.code && event.code === 'Escape';

        if (!event || docTarget || escPressed) {

            window.spryJsTogglers.forEach(togglerObject => {
                if (((togglerObject.dismissible) || togglerObject.escapable && escPressed) && togglerObject.el && togglerObject.el !== docTarget && !togglerObject.el.contains(docTarget) && togglerObject.toggleSelector) {
                    getElements(togglerObject.toggleSelector, togglerObject.el).forEach(toggleElement => {
                        setTimeout(() => {

                            if (toggleElement === docTarget || (toggleElement.contains(docTarget) && (!targetTag || targetTag && !['A','BUTTON'].includes(targetTag)))) return;

                            for (const innerTogglerObject of window.spryJsTogglers) {
                                if (innerTogglerObject.el !== togglerObject.el && (innerTogglerObject.el === docTarget || innerTogglerObject.el.contains(docTarget))) {
                                    if (innerTogglerObject.closeSelector) {
                                        for(const innerCloseElement of getElements(innerTogglerObject.closeSelector, innerTogglerObject.el)) {
                                            if (innerCloseElement === toggleElement) return;
                                        }
                                    }
                                    if (innerTogglerObject.toggleSelector) {
                                        for(const innerToggleElement of getElements(innerTogglerObject.toggleSelector, innerTogglerObject.el)) {
                                            if (innerToggleElement === toggleElement) return;
                                        }
                                    }
                                    if (innerTogglerObject.openSelector) {
                                        for(const innerOpenElement of getElements(innerTogglerObject.openSelector, innerTogglerObject.el)) {
                                            if (innerOpenElement === toggleElement) return;
                                        }
                                    }
                                }
                            }

                            if (toggleElement.classList.contains(classOpen)) {
                                toggleItem(togglerObject.el);
                            }
                        }, 20);
                    });
                }
            });
        }
    }

    const elements = typeof items === 'object' ? items : document.querySelectorAll(items);

    if (!elements) return;

    if (!window.spryJsTogglers) window.spryJsTogglers = [];

    elements.forEach((toggler: Element) => {

        if (toggler.spryJsToggleLoaded) {
            return;
        }

        const toggleSelector = toggler.getAttribute(dataToggleAttribute);
        const openSelector   = toggler.getAttribute(dataToggleOpenAttribute);
        const closeSelector  = toggler.getAttribute(dataToggleCloseAttribute);
        const dismissible    = toggler.hasAttribute(dataToggleDismissibleAttribute);
        const escapable      = toggler.hasAttribute(dataToggleEscapableAttribute);
        const timeout        = toggler.getAttribute(dataToggleTimeoutAttribute);

        const togglerData = {
            el: toggler,
            toggleSelector: toggleSelector ? toggleSelector : null,
            openSelector: openSelector ? openSelector : null,
            closeSelector: closeSelector || closeSelector === '' ? closeSelector : null,
            dismissible: dismissible,
            escapable: escapable,
            timeout: timeout ? parseInt(timeout) : 0,
            timer: null
        };

        window.spryJsTogglers.push(togglerData);
        toggler.spryJsToggleLoaded = true;
        toggler.addEventListener('click', (event: Event) => {
            toggleItem(toggler, 'toggle', event);
        });
    });

    /**
     * Listen for all Document Clicks and Close Toggles if needed.
     */
    if (!window.spryJsToggleWindowListener) {
        document.addEventListener('click', closeAllToggles);
        document.addEventListener('keyup', closeAllToggles);
        window.spryJsToggleWindowListener = true;
    }

    function destroy() {
        if (window.spryJsToggleWindowListener) {
            document.removeEventListener('click', closeAllToggles);
            document.removeEventListener('keyup', closeAllToggles);
            window.spryJsToggleWindowListener = true;
        }

        elements.forEach((toggler: Element) => {

            if (!toggler.spryJsToggleLoaded) {
                return;
            }
    
            // const toggleSelector = toggler.getAttribute(dataToggleAttribute);
            // const openSelector   = toggler.getAttribute(dataToggleOpenAttribute);
            // const closeSelector  = toggler.getAttribute(dataToggleCloseAttribute);
            // const dismissible    = toggler.hasAttribute(dataToggleDismissibleAttribute);
            // const escapable      = toggler.hasAttribute(dataToggleEscapableAttribute);
            // const timeout        = toggler.getAttribute(dataToggleTimeoutAttribute);
    
            // const togglerData = {
            //     el: toggler,
            //     toggleSelector: toggleSelector ? toggleSelector : null,
            //     openSelector: openSelector ? openSelector : null,
            //     closeSelector: closeSelector || closeSelector === '' ? closeSelector : null,
            //     dismissible: dismissible,
            //     escapable: escapable,
            //     timeout: timeout ? parseInt(timeout) : 0,
            //     timer: null
            // };
    
            // window.spryJsTogglers.push(togglerData);
            // toggler.spryJsToggleLoaded = true;
            toggler.removeEventListener('click', (event: Event) => {
                toggleItem(toggler, 'toggle', event);
            });
        });
    }
}