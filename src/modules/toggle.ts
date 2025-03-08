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
    classOpen: string[];
    classActive: string[];
}

export type SpryJsToggleOptions = {
    items?: Element[] | string;
    classOpen?: string | string[];
    classActive?: string | string[];
    attributeClassOpen?: string;
    attributeClassActive?: string;
    attributeToggle?: string;
    attributeClose?: string;
    attributeOpen?: string;
    attributeEscapable?: string;
    attributeDismissible?: string;
    attributeTimeout?: string;
}

export function toggle({
    items = '[data-toggle], [data-toggle-close]',
    classOpen = 'open',
    classActive = 'active',
    attributeClassOpen = 'data-toggle-class-open',
    attributeClassActive = 'data-toggle-class-active',
    attributeToggle = 'data-toggle',
    attributeClose = 'data-toggle-close',
    attributeOpen = 'data-toggle-open',
    attributeEscapable = 'data-toggle-escapable',
    attributeDismissible = 'data-toggle-dismissible',
    attributeTimeout = 'data-toggle-timeout',
}: SpryJsToggleOptions = {}): {update: Function, destroy: Function} {

    let controller: AbortController | null = null;
    let togglers: SpryJsToggler[] = [];

    /**
     * Get the Element
     * 
     * @param string|object toggleObjectOrEvent - Can be an Dom Element or a Selector.
     * @param Element|null  fromElement         - Element to start selector from.
     * 
     * @returns void
     */
    function getElements(item: Element | KeyboardEvent | Event | string, fromElement?: Element): Element[] {

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
    function toggleItem(elem: Element, forceAction?: string, event?: Event) {
        let opened = false;
        let elementData: Element[] = [];
        const togglersCount = togglers.length;

        // Update all Event Togglers and Toggle Elements
        for (let i = 0; i < togglersCount; i++) {
            if (togglers[i].el && elem === togglers[i].el) {

                if (togglers[i].timer) {
                    clearTimeout((togglers[i].timer as Timer));
                }

                if (togglers[i].closeSelector === '') {
                    if (togglers[i].classOpen) {
                        // togglers[i].classOpen.forEach(className => {
                            if (!togglers[i].classOpen.some(className => !togglers[i].el.classList.contains(className))) {
                            // if (togglers[i].el.classList.contains(className)) {
                                if (event && event.target === togglers[i].el) {
                                    togglers[i].el.classList.remove(...togglers[i].classOpen);
                                    togglers[i].el.setAttribute('aria-expanded', 'false');
                                    elementData.push(togglers[i].el);
                                    opened = false;
                                }
                            } else {
                                var closestOpen = togglers[i].el.closest('.'+togglers[i].classOpen.join('.'));
                                if (closestOpen) {
                                    closestOpen.classList.remove(...togglers[i].classOpen);
                                    closestOpen.setAttribute('aria-expanded', 'false');
                                    elementData.push(closestOpen);
                                    opened = false;
                                }
                            }
                        // });
                    }
                    // if (togglers[i].el.classList.contains(togglers[i].classOpen)) {
                    //     if (event && event.target === togglers[i].el) {
                    //         togglers[i].el.classList.remove(togglers[i].classOpen);
                    //         togglers[i].el.setAttribute('aria-expanded', 'false');
                    //         elementData.push(togglers[i].el);
                    //         opened = false;
                    //     }
                    // } else {
                    //     var closestOpen = togglers[i].el.closest('.'+togglers[i].classOpen);
                    //     if (closestOpen) {
                    //         closestOpen.classList.remove(togglers[i].classOpen);
                    //         closestOpen.setAttribute('aria-expanded', 'false');
                    //         elementData.push(closestOpen);
                    //         opened = false;
                    //     }
                    // }
                }

                if (togglers[i].closeSelector) {
                    getElements((togglers[i].closeSelector as string), elem).forEach(closeElement => {
                        closeElement.classList.remove(...togglers[i].classOpen);
                        closeElement.setAttribute('aria-expanded', 'false');
                        elementData.push(closeElement);
                        opened = false;
                    });
                }

                if (togglers[i].toggleSelector && (!forceAction || forceAction === 'toggle')) {
                    getElements((togglers[i].toggleSelector as string), elem).forEach(toggleElement => {

                        opened = !togglers[i].classOpen.some(className => !toggleElement.classList.contains(className)) ? true : false;

                        if (opened) {
                            toggleElement.classList.remove(...togglers[i].classOpen);
                            toggleElement.setAttribute('aria-expanded', 'false');
                        } else {
                            toggleElement.classList.add(...togglers[i].classOpen);
                            toggleElement.setAttribute('aria-expanded', 'true');
                        }

                        // toggleElement.classList.toggle(togglers[i].classOpen);
                        // // opened = toggleElement.classList.contains(togglers[i].classOpen) ? true : false;
                        // opened = !togglers[i].classOpen.some(className => !toggleElement.classList.contains(className)) ? true : false;
                        // toggleElement.setAttribute('aria-expanded', opened ? 'true' : 'false');
                        
                        elementData.push(toggleElement);
                    });
                }

                if (togglers[i].openSelector && (!forceAction || forceAction === 'open')) {
                    getElements((togglers[i].openSelector as string), elem).forEach(openElement => {
                        openElement.classList.add(...togglers[i].classOpen);
                        openElement.setAttribute('aria-expanded', 'true');
                        elementData.push(openElement);
                        opened = true;
                    });
                }

                togglers[i].el.toggleAttribute('aria-pressed', opened);

                if (opened) {
                    togglers[i].el.classList.add(...togglers[i].classActive);
                } else {
                    togglers[i].el.classList.remove(...togglers[i].classActive);
                }
                // togglers[i].el.classList.toggle(togglers[i].classActive, opened);

                if (opened && togglers[i].timeout && togglers[i].timeout > 0) {
                    togglers[i].timer = setTimeout(() => {
                        if (togglers[i].toggleSelector) {
                            toggleItem(togglers[i].el);
                        }
                    }, togglers[i].timeout);
                }
            }
        }

        // Update all corresponding Togglers
        for (let i = 0; i < togglersCount; i++) {
            if (togglers[i].closeSelector) {
                getElements((togglers[i].closeSelector as string), togglers[i].el).forEach(closeElement => {
                    elementData.forEach(element => {
                        if (element === closeElement) {
                            togglers[i].el.toggleAttribute('aria-pressed', false);
                            togglers[i].el.classList.remove(...togglers[i].classActive);
                        }
                    });
                });
            }

            if (togglers[i].toggleSelector) {
                getElements((togglers[i].toggleSelector as string), togglers[i].el).forEach(toggleElement => {
                    elementData.forEach(element => {
                        if (element === toggleElement) {
                            // opened = toggleElement.classList.contains(togglers[i].classOpen) ? true : false;
                            opened = !togglers[i].classOpen.some(className => !toggleElement.classList.contains(className)) ? true : false;
                            togglers[i].el.toggleAttribute('aria-pressed', opened);
                            if (opened) {
                                togglers[i].el.classList.add(...togglers[i].classActive);
                            } else {
                                togglers[i].el.classList.remove(...togglers[i].classActive);
                            }
                        }
                    });
                });
            }

            if (togglers[i].openSelector) {
                getElements((togglers[i].openSelector as string), togglers[i].el).forEach(openElement => {
                    elementData.forEach(element => {
                        if (element === openElement) {
                            togglers[i].el.toggleAttribute('aria-pressed', true);
                            togglers[i].el.classList.add(...togglers[i].classActive);
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
    function closeAllToggles(event: Event | KeyboardEvent) {
        var eventTarget: HTMLElement | null = event && event.target instanceof HTMLElement ? event.target : null;
        var targetTag: string | null = eventTarget && eventTarget.tagName ? eventTarget.tagName : null;
        var docTarget: HTMLElement | null = eventTarget && event.type === 'click' ? eventTarget : null;
        var escPressed = event && event.type && event.type === 'keyup' && event instanceof KeyboardEvent && event.code && event.code === 'Escape';

        if (!event || docTarget || escPressed) {

            togglers.forEach(togglerObject => {
                if (((togglerObject.dismissible) || togglerObject.escapable && escPressed) && togglerObject.el && togglerObject.el !== docTarget && !togglerObject.el.contains(docTarget) && togglerObject.toggleSelector) {
                    getElements(togglerObject.toggleSelector, togglerObject.el).forEach(toggleElement => {
                        setTimeout(() => {

                            if (toggleElement === docTarget || (toggleElement.contains(docTarget) && (!targetTag || targetTag && !['A','BUTTON'].includes(targetTag)))) return;

                            for (const innerTogglerObject of togglers) {
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
                            if (!togglerObject.classOpen.some(className => !toggleElement.classList.contains(className))) {
                                toggleItem(togglerObject.el);
                            }
                            // if (toggleElement.classList.contains(togglerObject.classOpen)) {
                            //     toggleItem(togglerObject.el);
                            // }
                        }, 20);
                    });
                }
            });
        }
    }

    function toggleClick(event: Event) {
        const toggler = event && event.target ? (event.target as HTMLElement) : null;
        if (toggler) toggleItem(toggler, 'toggle', event);
    }

    function addEventListeners() {
        if (togglers) {

            if (!controller) {
                controller = new AbortController();
            }

            if (controller) {
                for (let t = 0; t < togglers.length; t++) {
                    if (togglers[t] && togglers[t].el && controller) {
                        togglers[t].el.addEventListener('click', toggleClick, {signal: controller.signal});
                    }
                }
                // Listen for all Document Clicks and Close Toggles if needed
                document.addEventListener('click', closeAllToggles, {signal: controller.signal});
                document.addEventListener('keyup', closeAllToggles, {signal: controller.signal});
            }
        }
    }

    function update() {
        let toggleSelector, openSelector, closeSelector, timeout, dataClassOpen, dataClassActive;
        destroy();
        const elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                closeSelector   = elements[e].getAttribute(attributeClose);
                dataClassActive = elements[e].getAttribute(attributeClassActive) ?? classActive;
                dataClassOpen   = elements[e].getAttribute(attributeClassOpen) ?? classOpen;
                openSelector    = elements[e].getAttribute(attributeOpen);
                timeout         = elements[e].getAttribute(attributeTimeout);
                toggleSelector  = elements[e].getAttribute(attributeToggle);
                togglers.push({
                    el: elements[e],
                    classActive: typeof dataClassActive === 'string' ? dataClassActive.split(' ') : dataClassActive,
                    classOpen: typeof dataClassOpen === 'string' ? dataClassOpen.split(' ') : dataClassOpen,
                    closeSelector: closeSelector || closeSelector === '' ? closeSelector : null,
                    dismissible: elements[e].hasAttribute(attributeDismissible),
                    escapable: elements[e].hasAttribute(attributeEscapable),
                    openSelector: openSelector ? openSelector : null,
                    timeout: timeout ? parseInt(timeout) : 0,
                    timer: null,
                    toggleSelector: toggleSelector ? toggleSelector : null,
                });
            }
        }

        addEventListeners();
    }

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }
        togglers = [];
    }

    update();

    return {
        update: update,
        destroy: destroy
    }
}