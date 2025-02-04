//!
//! SpryJs Parallax Module

type SpryJsObserverOptions = {
    classObserve: string;
    classObserving: string;
    classObserved: string;
    rootMargin: string;
    threshold: number | number[];
    delay: number;
}

export function loadObserver(userOptions?: SpryJsObserverOptions) {

    const defaults = {
        classObserve: 'observe',
        classObserving: 'observing',
        classObserved: 'observed',
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
        delay: 100,
    }

    const options: SpryJsObserverOptions = { ...defaults, ...userOptions };
    const observerElements = Array.from(document.querySelectorAll('.' + options.classObserve) as NodeListOf<HTMLElement>);
    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            setTimeout(() => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(options.classObserving);
                    entry.target.classList.add(options.classObserved);
                } else {
                    entry.target.classList.remove(options.classObserving);
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