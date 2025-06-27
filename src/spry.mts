//!
//! SpryJs Query Module

import { navigable, type SpryJsNavigableOptions, } from './modules/navigable.ts';
import { observe, type SpryJsObserveOptions, } from './modules/observe.ts';
import { parallax, type SpryJsParallaxOptions, } from './modules/parallax.ts';
import { scrollspy, type SpryJsScrollSpyOptions, } from './modules/scrollspy.ts';
import { slider, type SpryJsSliderOptions, } from './modules/slider.ts';
import { toggle, type SpryJsToggleOptions, } from './modules/toggle.ts';
import { query, type SpryJsQueryCollection } from './modules/query.ts';
import cookie, { type SpryJsCookie } from './modules/cookie.ts';
import hash, { type SpryJsHash } from './modules/hash.ts';

type spryJsObjType = {
    destroy: Function,
    update: Function
}

type spryCallableObject = {
  (...args: any[]): void;
} & SpryJsCollection;

export type SpryJsComponentCollection = {
    cookie: SpryJsCookie;
    hash: SpryJsHash;
    navigableObj: spryJsObjType[];
    observeObj: spryJsObjType[];
    parallaxObj: spryJsObjType[];
    scrollspyObj: spryJsObjType[];
    sliderObj: spryJsObjType[];
    toggleObj: spryJsObjType[];
    query(selector: any, fromElement?: Element | Document): SpryJsCollection;
    load(): SpryJsCollection;
    update(): SpryJsCollection;
    destroy(): SpryJsCollection;
    navigable(): SpryJsCollection;
    navigableUpdate(): SpryJsCollection;
    navigableDestroy(): SpryJsCollection;
    observe(): SpryJsCollection;
    observeUpdate(): SpryJsCollection;
    observeDestroy(): SpryJsCollection;
    parallax(): SpryJsCollection;
    parallaxUpdate(): SpryJsCollection;
    parallaxDestroy(): SpryJsCollection;
    scrollspy(): SpryJsCollection;
    scrollspyUpdate(): SpryJsCollection;
    scrollspyDestroy(): SpryJsCollection;
    slider(): SpryJsCollection;
    sliderUpdate(): SpryJsCollection;
    sliderDestroy(): SpryJsCollection;
    toggle(): SpryJsCollection;
    toggleUpdate(): SpryJsCollection;
    toggleDestroy(): SpryJsCollection;
}

export type SpryJsCollection =  SpryJsComponentCollection & SpryJsQueryCollection;

//!
//! spry Collection Component
const core: SpryJsCollection = {

    ...query(''),
    cookie: cookie,
    hash: hash,
    navigableObj: [],
    observeObj: [],
    parallaxObj: [],
    scrollspyObj: [],
    sliderObj: [],
    toggleObj: [],
    
    query: function(selector: any, fromElement: Element | Document = document): SpryJsCollection {
        this.selector = selector;
        this.elements = query(selector, fromElement).elements;
        this.el = this.elements[0] ? this.elements[0] : null;
        return this;
    },

    navigable: function(options?: SpryJsNavigableOptions): SpryJsCollection {            
        this.navigableObj.push(navigable({...{items: this.elements}, ...options}));
        return this;
    },

    navigableUpdate: function(): SpryJsCollection {
        if (this.navigableObj) {
            for (let i = 0; i < this.navigableObj.length; i++) {
                this.navigableObj[i].update();
            }
        }
        return this;
    },

    navigableDestroy: function(): SpryJsCollection {
        if (this.navigableObj) {
            for (let i = 0; i < this.navigableObj.length; i++) {
                this.navigableObj[i].destroy();
            }
        }
        return this;
    },

    observe: function(options?: SpryJsObserveOptions): SpryJsCollection {
        this.observeObj.push(observe({...{items: this.elements}, ...options}));
        return this;
    },

    observeUpdate: function(): SpryJsCollection {
        if (this.observeObj) {
            for (let i = 0; i < this.observeObj.length; i++) {
                this.observeObj[i].update();
            }
        }
        return this;
    },

    observeDestroy: function(): SpryJsCollection {
        if (this.observeObj) {
            for (let i = 0; i < this.observeObj.length; i++) {
                this.observeObj[i].destroy();
            }
        }
        return this;
    },

    parallax: function(options?: SpryJsParallaxOptions): SpryJsCollection {
        this.parallaxObj.push(parallax({...{items: this.elements}, ...options}));
        return this;
    },
    
    parallaxUpdate: function(): SpryJsCollection {
        if (this.parallaxObj) {
            for (let i = 0; i < this.parallaxObj.length; i++) {
                this.parallaxObj[i].update();
            }
        }
        return this;
    },

    parallaxDestroy: function(): SpryJsCollection {
        if (this.parallaxObj) {
            for (let i = 0; i < this.parallaxObj.length; i++) {
                this.parallaxObj[i].destroy();
            }
        }
        return this;
    },

    scrollspy: function(options?: SpryJsScrollSpyOptions): SpryJsCollection {
        this.scrollspyObj.push(scrollspy({...{items: this.elements}, ...options}));
        return this;
    },

    scrollspyUpdate: function(): SpryJsCollection {
        if (this.scrollspyObj) {
            for (let i = 0; i < this.scrollspyObj.length; i++) {
                this.scrollspyObj[i].update();
            }
        }
        return this;
    },

    scrollspyDestroy: function(): SpryJsCollection {
        if (this.scrollspyObj) {
            for (let i = 0; i < this.scrollspyObj.length; i++) {
                this.scrollspyObj[i].destroy();
            }
        }
        return this;
    },

    slider: function(options?: SpryJsSliderOptions): SpryJsCollection {
        this.sliderObj.push(slider({...{items: this.elements}, ...options}));
        return this;
    },

    sliderUpdate: function(): SpryJsCollection {
        if (this.sliderObj) {
            for (let i = 0; i < this.sliderObj.length; i++) {
                this.sliderObj[i].update();
            }
        }
        return this;
    },

    sliderDestroy: function(): SpryJsCollection {
        if (this.sliderObj) {
            for (let i = 0; i < this.sliderObj.length; i++) {
                this.sliderObj[i].destroy();
            }
        }
        return this;
    },

    toggle: function(options?: SpryJsToggleOptions): SpryJsCollection {
        this.toggleObj.push(toggle({...{items: this.elements}, ...options}));
        return this;
    },

    toggleUpdate: function(): SpryJsCollection {
        if (this.toggleObj) {
            for (let i = 0; i < this.toggleObj.length; i++) {
                this.toggleObj[i].update();
            }
        }
        return this;
    },

    toggleDestroy: function(): SpryJsCollection {
        if (this.toggleObj) {
            for (let i = 0; i < this.toggleObj.length; i++) {
                this.toggleObj[i].destroy();
            }
        }
        return this;
    },

    load: function(): SpryJsCollection {
        this.navigableObj.push(navigable());
        this.observeObj.push(observe());
        this.parallaxObj.push(parallax());
        this.scrollspyObj.push(scrollspy());
        this.sliderObj.push(slider());
        this.toggleObj.push(toggle());
        return this;
    },

    update: function(): SpryJsCollection {
        this.navigableUpdate();
        this.observeUpdate();
        this.parallaxUpdate();
        this.scrollspyUpdate();
        this.sliderUpdate();
        this.toggleUpdate();
        return this;
    },

    destroy: function(): SpryJsCollection {
        this.navigableDestroy();
        this.observeDestroy();
        this.parallaxDestroy();
        this.scrollspyDestroy();
        this.sliderDestroy();
        this.toggleDestroy();
        return this;
    }
};

// Create proxy
const spry = new Proxy<spryCallableObject>(function () {} as spryCallableObject, {
  apply(_target, _thisArg, args: any[]) {
    var selector    = args[0];
    var fromElement = args.length > 1 ? args[1] : undefined;
    core.query.call(core, selector, fromElement);
    return spry;
  },
  get(_target, prop: keyof SpryJsCollection) {
    const value = core[prop];
    return typeof value === 'function' ? value.bind(core) : value;
  }
});

//!
//! SpryJS Exports
export { cookie, hash, navigable, observe, parallax, slider, scrollspy, toggle, query, spry as default };