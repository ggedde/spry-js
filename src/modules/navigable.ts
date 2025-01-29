//! SpryJs Navigable Module
type SpryJsNavigableOptions = {
    selector: string;
};

export function loadNavigable(userOptions?: SpryJsNavigableOptions) {

    const defaults = {
        selector: ".navigable",
    };

    const options = { ...defaults, ...userOptions };

    const navigateItems = function (event: Event) {

        if (!event.target) {
            return;
        }

        const target: HTMLElement | null = event.target ? (event.target as HTMLElement) : null;
        const keyCode: string = (event as KeyboardEvent).code;
        const selected: HTMLElement | null = document.activeElement ? (document.activeElement as HTMLElement) : null;
        let items: HTMLElement[] = [];
        let navigableContainer: HTMLElement | null = null;

        if (!target || !selected || !keyCode || !['Space', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(keyCode)) {
            return;
        }

        if (target.parentElement && target.parentElement.querySelector(options.selector) === target) {
            navigableContainer = target;
            items = [navigableContainer];
        } else {
            navigableContainer = target.closest(options.selector);
            if (navigableContainer) {
                const queryItems = navigableContainer.querySelectorAll('a, button, input, [tabindex]');
                items = queryItems ? Array.from((queryItems as NodeListOf<HTMLElement>)) : [];
            }
        }

        if (!navigableContainer || !items) {
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
        


        // var selected = list.querySelector('li:focus-within');
        // if (!selected) {
        //     selected = list.querySelector(':focus');
        // }
        // if (selected) {
        //     if (keyCode === 'Escape') {
        //         target.blur();
        //     } else if (['Space', 'Enter'].includes(keyCode) && ['LABEL', 'INPUT'].includes(target.tagName)) {
        //         event.preventDefault();
        //         target.click();
        //     } else if (['Space'].includes(keyCode) && ['A'].includes(target.tagName)) {
        //         event.preventDefault();
        //         target.click();
        //     } else if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(keyCode)) {
        //         event.preventDefault();
        //         var children = list.children[0].tagName === 'UL' ? Array.from(list.children[0].children) : Array.from(list.children);
        //         var index = children.indexOf(selected);
        //         if (index > -1) {
        //             var newIndex = (['ArrowRight', 'ArrowDown'].includes(keyCode) ? index + 1 : index - 1);
        //             var sibling = children[newIndex];
        //             if (sibling && sibling.tagName === 'LI' && !sibling.querySelector('a, button, .button, input')) {
        //                 // Skip if child has not selectable item
        //                 var newIndex = (['ArrowRight', 'ArrowDown'].includes(keyCode) ? newIndex + 1 : newIndex - 1);
        //                 var sibling = children[newIndex];
        //             }
        //             if (sibling && sibling.children && sibling.children[0]) {
        //                 sibling = sibling.children[0];
        //                 if (!['A', 'BUTTON', 'LABEL', 'INPUT'].includes(sibling.tagName)) {
        //                     if (['ArrowRight', 'ArrowDown'].includes(keyCode)) {
        //                         newIndex++;
        //                     } else {
        //                         newIndex--;
        //                     }
        //                     var sibling = children[newIndex];
        //                     if (sibling && sibling.children && sibling.children[0]) {
        //                         sibling = sibling.children[0];
        //                     }
        //                 }
        //             }
        //             if (sibling) {
        //                 (sibling as HTMLElement).focus();
        //             }
        //         }
        //     }
        // }
    }

    document.querySelectorAll(options.selector).forEach(list => {
        list.removeEventListener('keydown', navigateItems);
        list.addEventListener('keydown', navigateItems);
    })
}