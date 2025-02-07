//!
//! SpryJs Query Module

import { navigable, type SpryJsNavigableOptions, } from './modules/navigable.ts';
import { observe,   type SpryJsObserverOptions,  } from './modules/observe.ts';
import { parallax,  type SpryJsParallaxOptions,  } from './modules/parallax.ts';
import { scrollspy, type SpryJsScrollSpyOptions, } from './modules/scrollspy.ts';
import { slider,    type SpryJsSliderOptions,    } from './modules/slider.ts';
import { toggle,    type SpryJsToggleOptions,    } from './modules/toggle.ts';
import { query,     type SpryJsQueryCollection   } from './modules/query.ts';
import { cookie                                  } from './modules/cookie.ts';

type SpryJsComponentCollection = {
    options(options: any): any;
    navigable(): SpryJsCollection;
    observe(): SpryJsCollection;
    parallax(): SpryJsCollection;
    scrollspy(): SpryJsCollection;
    slider(): SpryJsCollection;
    toggle(): SpryJsCollection;
    load(): void;
}

type SpryJsCollection = SpryJsQueryCollection & SpryJsComponentCollection;

/**
 * Query Elements
 *
 * @param selector string   - Selector String.
 *
 * @var elements array - Queried elements.
 *
 * @method each function(callback: Function)                            - Loops through each element found in query
 * @method toggleClass function(className: string, force?: boolean)     - Toggles Class of each element in query
 * @method addClass function(className: string)                         - Adds Class to each element in query
 * @method removeClass function(className: string)                      - Removes Class of each element in query
 * @method toggleAttr function(attributeName: string, force?: boolean)  - Toggles Attribute of each element in query
 * @method attr function(attributeName: string, attributeValue: string) - Sets Attribute to each element in query
 * @method removeAttr function(attributeName: string)                   - Removes Attribute of each element in query
 * @method on function(action: string, callback: Function)              - Adds Event Listener to each element in query
 *
 * @returns object
 */

//!
//! SpryJS Collection Component
const SpryJS = function(selector: string): SpryJsCollection {

    return {
        ...query(selector),
        options: function(options: any) {
            return {...{selector: selector, items: this.elements}, ...options};
        },
        navigable: function(options?: SpryJsNavigableOptions): SpryJsCollection {
            navigable({...{items: this.elements}, ...options});
            return this;
        },

        observe: function(options?: SpryJsObserverOptions): SpryJsCollection {
            observe({...{items: this.elements}, ...options});
            return this;
        },

        parallax: function(options?: SpryJsParallaxOptions): SpryJsCollection {
            parallax({...{items: this.elements}, ...options});
            return this;
        },

        scrollspy: function(options?: SpryJsScrollSpyOptions): SpryJsCollection {
            scrollspy({...{items: this.elements}, ...options});
            return this;
        },

        slider: function(options?: SpryJsSliderOptions): SpryJsCollection {
            slider({...{items: this.elements}, ...options});
            return this;
        },

        toggle: function(options?: SpryJsToggleOptions): SpryJsCollection {
            toggle({...{items: this.elements}, ...options});
            return this;
        },

        load: function() {
            navigable();
            observe();
            parallax();
            scrollspy();
            slider();
            toggle();
        }
    };
};

//!
//! SpryJS Exports
export { cookie, navigable, observe, parallax, slider, scrollspy, toggle, query, SpryJS as default };