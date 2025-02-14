//!
//! SpryJs Navigable Module

type SpryJsNavigableListEvent = {
    list: Element;
    listener: EventListener;
};


export type SpryJsNavigableOptions = {
    items?: Element[] | string;
    anchorSelector?: string;
    anchorDataAttribute?: string;
};

export function navigable({
    items = '.navigable',
    anchorSelector = 'a, button, input, [tabindex]',
    anchorDataAttribute = 'data-navigable-anchors',
}: SpryJsNavigableOptions = {}): {destroy: Function, update: Function} {

    let controller: AbortController | null = null;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let listeners: SpryJsNavigableListEvent[] = [];

    function navigate(this: Element, event: Event) {

        if (!event.target) {
            return;
        }

        const list: HTMLElement | null = this ? (this as HTMLElement) : null;

        if (!list) {
            return;
        }

        const dataAnchorSelector = list.getAttribute(anchorDataAttribute);
        const target: HTMLElement | null = event.target ? (event.target as HTMLElement) : null;
        const keyCode: string = (event as KeyboardEvent).code;
        const selected: HTMLElement | null = document.activeElement ? (document.activeElement as HTMLElement) : null;
        let anchorItems: HTMLElement[] = [];

        if (!target || !selected || !keyCode || !['Space', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(keyCode)) {
            return;
        }

        anchorSelector = dataAnchorSelector ? dataAnchorSelector : anchorSelector;

        if (list === target) {
            anchorItems = [target];
        } else {
            if (list && anchorSelector) {
                const queryItems = list.querySelectorAll(anchorSelector);
                anchorItems = queryItems ? Array.from((queryItems as NodeListOf<HTMLElement>)) : [];
            }
        }

        if (!anchorItems) {
            return;
        }

        var selectedIndex = Array.from(anchorItems).indexOf(selected);

        if (selectedIndex === -1) {
            return;
        }

        if (keyCode === 'Escape') {
            selected.blur();
        } else if (['Space', 'Enter'].includes(keyCode)) {
            event.preventDefault();
            selected.click();
        } else if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(keyCode)) {
            event.preventDefault();
            var newIndex = (['ArrowRight', 'ArrowDown'].includes(keyCode) ? selectedIndex + 1 : selectedIndex - 1);
            var sibling = anchorItems[newIndex];
            if (sibling) {
                sibling.focus();
            }
        }
    }

    function update() {
        destroy();
        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                listeners.push({list: elements[e], listener: navigate.bind(elements[e])});  
            }
        }

        if (!controller) {
			controller = new AbortController();
		}

        for (let l = 0; l < listeners.length; l++) {
            if (listeners[l].list && controller) {
                listeners[l].list.addEventListener('keydown', listeners[l].listener, {signal: controller.signal});
            }
        };
    }

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }
        listeners = [];
    };

    update();

    return {
        destroy: destroy,
        update: update,
    }
}