//!
//! SpryJs Observer Module

export type SpryJsObserveOptions = {
    items?: Element[] | string,
    delay?: number;
    threshold?: number | number[];
    rootMargin?: string;
    attributeDelay?: string;
    classObserving?: string | string[];
    attributeClassObserving?: string;
    classObserved?: string | string[];
    attributeClassObserved?: string;
}

export function observe({
    items = '.observe',
    delay = 50,
    threshold = 0,
    rootMargin = '0px 0px 0px 0px',
    classObserved = 'observed',
    classObserving = 'observing',
    attributeClassObserved = 'data-observe-class-observed',
    attributeClassObserving = 'data-observe-class-observing',
    attributeDelay = 'data-observe-delay',
}: SpryJsObserveOptions = {}): { update: Function, destroy: Function } {

    let elements: Element[] | NodeListOf<Element> | null = null;
    let observer: IntersectionObserver | null = null;

    function createObserver() {

        observer = new IntersectionObserver(entries => {
            entries.forEach((entry, index) => {

                const elementClassObserving = attributeClassObserving ? entry.target.getAttribute(attributeClassObserving) : null;
                classObserving = elementClassObserving ? elementClassObserving.split(' ') : (typeof classObserving === 'string' ? classObserving.split(' ') : classObserving);

                const elementClassObserved = attributeClassObserved ? entry.target.getAttribute(attributeClassObserved) : null;
                classObserved = elementClassObserved ? elementClassObserved.split(' ') : (typeof classObserved === 'string' ? classObserved.split(' ') : classObserved);

                const elementDelay = attributeDelay ? entry.target.getAttribute(attributeDelay) : delay;

                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            if (classObserving) entry.target.classList.add(...classObserving);
                            if (classObserved) entry.target.classList.add(...classObserved);
                        }, ((elementDelay ? parseInt(elementDelay.toString()) : 0) * index));
                    });
                } else {
                    requestAnimationFrame(() => {
                        if (classObserving) entry.target.classList.remove(...classObserving);
                    });
                }
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