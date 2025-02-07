//!
//! SpryJs Navigable Module
export type SpryJsNavigableOptions = {
    items?: Element[] | string;
    anchorSelector?: string;
};

export const SpryJsNavigableDefaults: SpryJsNavigableOptions = {
    items: '.navigable',
    anchorSelector: 'a, button, input, [tabindex]',
};

declare global {
    interface Element {
        spryJsNavigableLoaded: boolean;
    }
}

export function navigable(userOptions?: SpryJsNavigableOptions) {
    const options = { ...SpryJsNavigableDefaults, ...userOptions };

    if (!options.items) return;

    (typeof options.items === 'object' ? options.items : document.querySelectorAll(options.items)).forEach(list => {
        if (!list.spryJsNavigableLoaded) {
            list.spryJsNavigableLoaded = true;
             list.addEventListener('keydown', (event: Event) => {
                if (!event.target) {
                    return;
                }

                const dataAnchorSelector = list.getAttribute('data-navigable-anchors');
                const anchorSelector = dataAnchorSelector ? dataAnchorSelector : options.anchorSelector;
        
                const target: HTMLElement | null = event.target ? (event.target as HTMLElement) : null;
                const keyCode: string = (event as KeyboardEvent).code;
                const selected: HTMLElement | null = document.activeElement ? (document.activeElement as HTMLElement) : null;
                let items: HTMLElement[] = [];
        
                if (!target || !selected || !keyCode || !['Space', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(keyCode)) {
                    return;
                }
        
                if (list === target) {
                    items = [target];
                } else {
                    if (list && anchorSelector) {
                        const queryItems = list.querySelectorAll(anchorSelector);
                        items = queryItems ? Array.from((queryItems as NodeListOf<HTMLElement>)) : [];
                    }
                }
        
                if (!items) {
                    return;
                }
        
                var selectedIndex = Array.from(items).indexOf(selected);
        
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
                    var sibling = items[newIndex];
                    if (sibling) {
                        sibling.focus();
                    }
                }
             });
        }
    })
}