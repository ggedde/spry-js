//!
//! SpryJs Observer Module

type SpryJsObserverOptions = {
    selector: string;
    classObserving: string | string[];
    classObserved: string | string[];
    rootMargin: string;
    threshold: number | number[];
    delay: number;
}

export function loadObserver(userOptions?: SpryJsObserverOptions) {

    const defaults = {
        selector: '.observe',
        classObserving: 'observing',
        classObserved: 'observed',
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
        delay: 50,
    }

    const options: SpryJsObserverOptions = { ...defaults, ...userOptions };

    if (typeof options.classObserving === 'string') {
        options.classObserving = options.classObserving.split(' ');
    }

    if (typeof options.classObserved === 'string') {
        options.classObserved = options.classObserved.split(' ');
    }

    const observerElements = Array.from(document.querySelectorAll(options.selector) as NodeListOf<HTMLElement>);
    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            setTimeout(() => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(...options.classObserving);
                    entry.target.classList.add(...options.classObserved);
                } else {
                    entry.target.classList.remove(...options.classObserving);
                }
            }, (options.delay * index));
        });
    }, {
        rootMargin: options.rootMargin,
        threshold: options.threshold
    });

    observerElements.forEach(observerElement => {
        observer.observe(observerElement);
    });
}