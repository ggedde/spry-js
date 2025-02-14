//!
//! SpryJs Observer Module

export type SpryJsObserveOptions = {
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
}: SpryJsObserveOptions = {}): {update: Function, destroy: Function} {

    let elements: Element[] | NodeListOf<Element> | null = null;
    let observer: IntersectionObserver | null = null;

    function createObserver() {

        if (typeof classObserving === 'string') {
            classObserving = classObserving.split(' ');
        }
    
        if (typeof classObserved === 'string') {
            classObserved = classObserved.split(' ');
        }

        observer = new IntersectionObserver(entries => {
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
    }

    function update() {
        destroy();
        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            if (!observer) {
                createObserver();
            }
            if (observer) {
                for (let e = 0; e < elements.length; e++) {
                    observer.observe(elements[e]);   
                }
            }
        }
    };

    function destroy() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    };

    update();

    return {
        update: update,
        destroy: destroy
    }
}