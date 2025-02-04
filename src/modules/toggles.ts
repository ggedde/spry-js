//!
//! SpryJs Toggles Module
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

type SpryJsToggleOptions = {
    classOpen: string;
    classActive: string;
}

declare global {
    interface Window {
        spryJsTogglers: SpryJsToggler[];
        spryJsToggleDocListener: boolean;
    }
}

window.spryJsTogglers = [];

export function loadToggles(userOptions?: SpryJsToggleOptions) {

    const defaults = {
        classOpen: 'open',
        classActive: 'active'
    }

    const options = {...defaults, ...userOptions};

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
    const toggle = function(elem: Element, forceAction?: string, event?: Event) {

        let opened = false;
        let elementData: Element[] = [];

        // Update all Event Togglers and Toggle Elements
        for (const togglerObject of window.spryJsTogglers) {
            if (togglerObject.el && elem === togglerObject.el) {

                if (togglerObject.timer) {
                    clearTimeout(togglerObject.timer);
                }

                if (togglerObject.closeSelector === '') {
                    if (togglerObject.el.classList.contains(options.classOpen)) {
                        if (event && event.target === togglerObject.el) {
                            togglerObject.el.classList.remove(options.classOpen);
                            togglerObject.el.setAttribute('aria-expanded', 'false');
                            elementData.push(togglerObject.el);
                            opened = false;
                        }
                    } else {
                        var closestOpen = togglerObject.el.closest('.'+options.classOpen);
                        if (closestOpen) {
                            closestOpen.classList.remove(options.classOpen);
                            closestOpen.setAttribute('aria-expanded', 'false');
                            elementData.push(closestOpen);
                            opened = false;
                        }
                    }
                }

                if (togglerObject.closeSelector) {
                    getElements(togglerObject.closeSelector, elem).forEach(closeElement => {
                        closeElement.classList.remove(options.classOpen);
                        closeElement.setAttribute('aria-expanded', 'false');
                        elementData.push(closeElement);
                        opened = false;
                    });
                }

                if (togglerObject.toggleSelector && (!forceAction || forceAction === 'toggle')) {
                    getElements(togglerObject.toggleSelector, elem).forEach(toggleElement => {
                        toggleElement.classList.toggle(options.classOpen);
                        opened = toggleElement.classList.contains(options.classOpen) ? true : false;
                        if (opened) {
                            toggleElement.setAttribute('aria-expanded', 'true');
                        } else {
                            toggleElement.setAttribute('aria-expanded', 'false');
                        }
                        
                        elementData.push(toggleElement);
                    });
                }

                if (togglerObject.openSelector && (!forceAction || forceAction === 'open')) {
                    getElements(togglerObject.openSelector, elem).forEach(openElement => {
                        openElement.classList.add(options.classOpen);
                        openElement.setAttribute('aria-expanded', 'true');
                        elementData.push(openElement);
                        opened = true;
                    });
                }

                togglerObject.el.toggleAttribute('aria-pressed', opened);
                togglerObject.el.classList.toggle(options.classActive, opened);

                if (opened && togglerObject.timeout && togglerObject.timeout > 0) {
                    togglerObject.timer = setTimeout(() => {
                        if (togglerObject.toggleSelector) {
                            toggle(togglerObject.el);
                        }
                    }, togglerObject.timeout);
                }
            }
        }

        // Update all corresponding Togglers
        window.spryJsTogglers.forEach(togglerObject => {
            if (togglerObject.closeSelector) {
                getElements(togglerObject.closeSelector, togglerObject.el).forEach(closeElement => {
                    elementData.forEach(element => {
                        if (element === closeElement) {
                            togglerObject.el.toggleAttribute('aria-pressed', false);
                            togglerObject.el.classList.toggle(options.classActive, false);
                        }
                    });
                });
            }

            if (togglerObject.toggleSelector) {
                getElements(togglerObject.toggleSelector, togglerObject.el).forEach(toggleElement => {
                    elementData.forEach(element => {
                        if (element === toggleElement) {
                            opened = toggleElement.classList.contains(options.classOpen) ? true : false;
                            togglerObject.el.toggleAttribute('aria-pressed', opened);
                            togglerObject.el.classList.toggle(options.classActive, opened);
                        }
                    });
                });
            }

            if (togglerObject.openSelector) {
                getElements(togglerObject.openSelector, togglerObject.el).forEach(openElement => {
                    elementData.forEach(element => {
                        if (element === openElement) {
                            togglerObject.el.toggleAttribute('aria-pressed', true);
                            togglerObject.el.classList.toggle(options.classActive, true);
                        }
                    });
                });
            }
        });
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

                            if (toggleElement.classList.contains(options.classOpen)) {
                                toggle(togglerObject.el);
                            }
                        }, 20);
                    });
                }
            });
        }
    }

    document.querySelectorAll('[data-toggle], [data-toggle-close]').forEach((toggler: Element) => {

        if (toggler.hasAttribute('data-toggle-loaded')) {
            return;
        }

        const toggleSelector     = toggler.getAttribute('data-toggle');
        const openSelector       = toggler.getAttribute('data-toggle-open');
        const closeSelector      = toggler.getAttribute('data-toggle-close');
        const dismissible        = toggler.hasAttribute('data-toggle-dismissible');
        const escapable          = toggler.hasAttribute('data-toggle-escapable');
        const timeout            = toggler.getAttribute('data-toggle-timeout');

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
        toggler.setAttribute('data-toggle-loaded', '');
        toggler.addEventListener('click', (event: Event) => {
            toggle(toggler, 'toggle', event);
        });
    });

    /**
     * Listen for all Document Clicks and Close Toggles if needed.
     */
    if (!window.spryJsToggleDocListener) {
        document.addEventListener('click', closeAllToggles);
        document.addEventListener('keyup', closeAllToggles);
        window.spryJsToggleDocListener = true;
    }
}
