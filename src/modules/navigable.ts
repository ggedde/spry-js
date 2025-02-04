//! SpryJs Navigable Module
type SpryJsNavigableOptions = {
    className: string;
    itemsSelector: string
};

export function loadNavigable(userOptions?: SpryJsNavigableOptions) {

    const defaults = {
        className: "navigable",
        itemsSelector: 'a, button, input, [tabindex]',
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

        if (target.parentElement && target.parentElement.querySelector('.'+options.className) === target) {
            navigableContainer = target;
            items = [navigableContainer];
        } else {
            navigableContainer = target.closest('.'+options.className);
            if (navigableContainer) {
                const queryItems = navigableContainer.querySelectorAll(options.itemsSelector);
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
    }

    document.querySelectorAll('.'+options.className).forEach(list => {
        list.removeEventListener('keydown', navigateItems);
        list.addEventListener('keydown', navigateItems);
    })
}