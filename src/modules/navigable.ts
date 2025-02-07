//!
//! SpryJs Navigable Module

declare global {
    interface Element {
        spryJsNavigableLoaded: boolean;
    }
}

export type SpryJsNavigableOptions = {
    items?: Element[] | string;
    anchorSelector?: string;
    anchorDataAttribute?: string;
};

export function navigable({
    items = '.navigable',
    anchorSelector = 'a, button, input, [tabindex]',
    anchorDataAttribute = 'data-navigable-anchors',
}: SpryJsNavigableOptions = {}) {

    (typeof items === 'object' ? items : document.querySelectorAll(items)).forEach(list => {
        if (!list.spryJsNavigableLoaded) {
            list.spryJsNavigableLoaded = true;
             list.addEventListener('keydown', (event: Event) => {
                if (!event.target) {
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
             });
        }
    })
}