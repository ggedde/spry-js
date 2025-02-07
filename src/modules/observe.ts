//!
//! SpryJs Observer Module

declare global {
    interface Element {
        spryJsObserverLoaded: boolean;
    }
}

export type SpryJsObserverOptions = {
    items?: Element[] | string,
    classObserving?: string | string[];
    classObserved?: string | string[];
    rootMargin?: string;
    threshold?: number | number[];
    delay?: number;
}

export function observe({
    items = '.observe',
    classObserving = 'observing',
    classObserved = 'observed',
    rootMargin = '0px 0px 0px 0px',
    threshold = 0,
    delay = 50,
}: SpryJsObserverOptions = {}) {

    const elements = typeof items === 'object' ? items : document.querySelectorAll(items);

    if (!elements) return;

    if (typeof classObserving === 'string') {
        classObserving = classObserving.split(' ');
    }

    if (typeof classObserved === 'string') {
        classObserved = classObserved.split(' ');
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            setTimeout(() => {
                if (entry.isIntersecting) {
                    if (classObserving) entry.target.classList.add(...classObserving);
                    if (classObserved) entry.target.classList.add(...classObserved);
                } else {
                    if (classObserving) entry.target.classList.remove(...classObserving);
                }
            }, ((delay ? delay : 0) * index));
        });
    }, {
        rootMargin: rootMargin,
        threshold: threshold
    });

    elements.forEach(element => {
        if (!element.spryJsObserverLoaded) observer.observe(element);
        element.spryJsObserverLoaded = true;
    });
}