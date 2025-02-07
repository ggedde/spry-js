//!
//! SpryJs Observer Module

export type SpryJsObserverOptions = {
    items?: Element[] | string,
    classObserving?: string | string[];
    classObserved?: string | string[];
    rootMargin?: string;
    threshold?: number | number[];
    delay?: number;
}

export const SpryJsObserverDefaults: SpryJsObserverOptions = {
    items: '.observe',
    classObserving: 'observing',
    classObserved: 'observed',
    rootMargin: '0px 0px 0px 0px',
    threshold: 0,
    delay: 50,
}

declare global {
    interface Element {
        spryJsObserverLoaded: boolean;
    }
}

export function observe(userOptions?: SpryJsObserverOptions) {

    const options: SpryJsObserverOptions = { ...SpryJsObserverDefaults, ...userOptions };
    const elements = typeof options.items === 'object' ? options.items : options.items ? document.querySelectorAll(options.items) : [];

    if (!elements) return;

    if (typeof options.classObserving === 'string') {
        options.classObserving = options.classObserving.split(' ');
    }

    if (typeof options.classObserved === 'string') {
        options.classObserved = options.classObserved.split(' ');
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            setTimeout(() => {
                if (entry.isIntersecting) {
                    if (options.classObserving) entry.target.classList.add(...options.classObserving);
                    if (options.classObserved) entry.target.classList.add(...options.classObserved);
                } else {
                    if (options.classObserving) entry.target.classList.remove(...options.classObserving);
                }
            }, ((options.delay ? options.delay : 0) * index));
        });
    }, {
        rootMargin: options.rootMargin,
        threshold: options.threshold
    });

    elements.forEach(element => {
        if (!element.spryJsObserverLoaded) observer.observe(element);
        element.spryJsObserverLoaded = true;
    });
}