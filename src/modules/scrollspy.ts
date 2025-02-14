//!
//! SpryJs ScrollSpy Module

type SpryJsScrollSpyAnchor = {
    top: number;
    link: Element;
}

export type SpryJsScrollSpyOptions = {
    items?: Element[] | string,
    anchorHashSelector?: string;
    anchorDataAttribute?: string;
	classActive?: string | string[];
    threshold?: number;
    progress?: 'active' | 'linear' | 'seen';
};

export function scrollspy({
    items = '.scrollspy',
    anchorHashSelector = '[href*="#"]',
    anchorDataAttribute = 'data-scrollspy',
    classActive = 'active',
    threshold = 200,
    progress = 'active',
}: SpryJsScrollSpyOptions = {}): {destroy: Function, update: Function} {

    const selectors = [anchorHashSelector, '['+anchorDataAttribute+']'];
    let controller: AbortController | null = null;
    let elements: Element[] | NodeListOf<Element> | null = null;
    let anchors: SpryJsScrollSpyAnchor[] = [];
    let resizeTimer: Timer | null = null;

    if (typeof classActive === 'string') {
        classActive = classActive.split(' ');
    }

    function runScrollEvents() {

        let y = window.scrollY;
        const l = anchors.length;
        for (let i = 0; i < l; i++) {
            
            // Active
            if (progress === 'active') {
                if (y > anchors[i].top) {
                    for (let a = 0; a < l; a++) {
                        anchors[a].link.classList.remove(...classActive);
                    }
                    anchors[i].link.classList.add(...classActive);
                    return;
                }
            }

            // Linear || Seen
            if (['linear', 'seen'].includes(progress)) {
                if (y > anchors[i].top) {
                    anchors[i].link.classList.add(...classActive);
                    if (progress === 'seen') return; // If Seen then return
                    for (let a = 0; a < l; a++) {
                        if (y <= anchors[a].top) {
                            anchors[a].link.classList.remove(...classActive);
                        }
                    }
                }
            }
        };
    }

    function runResizeEvents() {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(() => {
            runScrollEvents();
        }, 100);
    }

    function update() {

        anchors = [];
        const scrollPosition = window.scrollY;

        elements = typeof items === 'object' ? items : document.querySelectorAll(items);
        if (elements) {
            for (let e = 0; e < elements.length; e++) {
                if (document.body.contains(elements[e])) {
                    elements[e].querySelectorAll(selectors.join(',')).forEach(anchor => {

                        let section = null;

                        // Try Hash Selectors
                        const href = (anchor as HTMLElement).getAttribute('href');
                        if (href) {
                            try {
                                const url = new URL(href, window.location.href);
                                if (url && url.hash) {
                                    const hash = url.hash.replace('#', '').trim();
                                    if (hash) {
                                        section = document.querySelector('[id="'+hash+'"], a[name="'+hash+'"]');
                                    }
                                }
                            } catch (e) {
                                console.log('Invalid URL for ScrollSpy ('+href+')', e);
                            }
                        }

                        // Try Data Selectors if no Section found
                        if (!section) {
                            const dataSelector = (anchor as HTMLElement).getAttribute(anchorDataAttribute);
                            if (dataSelector) {
                                section = document.querySelector(dataSelector);
                            }
                        }

                        // Add Anchors if found Section
                        if (section) {
                            const sectionRect = section.getBoundingClientRect();
                            anchors.push({
                                top: (sectionRect.y + scrollPosition) - threshold,
                                link: anchor
                            });
                        }
                    });
                }
            }
            anchors = anchors.reverse();
        }

        if (!controller) {
			controller = new AbortController();
		}

        if (!anchors) {
            destroy();
        } else if (controller) {
            window.addEventListener('scroll', runScrollEvents, {signal: controller.signal});
            window.addEventListener('resize', runResizeEvents, {signal: controller.signal});
            runScrollEvents();
        }
    };

    function destroy() {
        if (controller) {
            controller.abort();
            controller = null;
        }
        anchors = [];
    };

    update();

    return {
        destroy: destroy,
        update: update
    }
}