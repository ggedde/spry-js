/*
* SpryJs 1.0.0
* https://ggedde.github.io/spry-js
*/
//! SpryJs Navigable Module
function U(J){let S={...{selector:".navigable"},...J},s=function(L){if(!L.target)return;let A=L.target?L.target:null,u=L.code,a=document.activeElement?document.activeElement:null,y=[],f=null;if(!A||!a||!u||!["Space","Enter","Escape","ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(u))return;if(A.parentElement&&A.parentElement.querySelector(S.selector)===A)f=A,y=[f];else if(f=A.closest(S.selector),f){let h=f.querySelectorAll("a, button, input, [tabindex]");y=h?Array.from(h):[]}if(!f||!y)return;var d=Array.from(y).indexOf(a);if(d===-1)return;if(u==="Escape")a.blur();else if(["Space","Enter"].includes(u))L.preventDefault(),a.click();else if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"].includes(u)){L.preventDefault();var r=["ArrowRight","ArrowDown"].includes(u)?d+1:d-1,i=y[r];if(i)i.focus()}};document.querySelectorAll(S.selector).forEach((L)=>{L.removeEventListener("keydown",s),L.addEventListener("keydown",s)})}//!
//! SpryJs ScrollSpy Module
function X(J){let S={...{selector:'.scrollspy [href^="#"]',classActive:"active"},...J},s=null,L=function(){var a=document.querySelectorAll(S.selector),y=[];if(a.length)a.forEach((f)=>{var d=f.getAttribute("href");if(d){var r=d.substring(1);document.querySelectorAll('[id="'+r+'"], a[name="'+r+'"]').forEach((i)=>{var h=i.getBoundingClientRect();y.push({id:r,top:h.y+window.scrollY-100,link:f})})}});return y.reverse()},A=function(){let a=window.scrollY;u.forEach((f)=>{f.link.classList.remove(S.classActive)});for(let f in u){var y=u[f];if(a>y.top){y.link.classList.add(S.classActive);break}}};var u=L();if(u.length)window.addEventListener("scroll",()=>{A()}),window.addEventListener("resize",()=>{if(s)clearTimeout(s);s=setTimeout(()=>{u=L()},100)});A()}//!
//! SpryJs Sliders Module
function Z(J){let S={...{selector:".slider",slides:".slider-slides",next:".slider-next",prev:".slider-prev",pagination:".slider-pagination"},...J};document.querySelectorAll(S.selector).forEach((s)=>{if(s.hasAttribute("data-loaded"))return;var L=parseInt((s.getAttribute("data-play")||0).toString()),A=s.hasAttribute("data-loop"),u=s.getAttribute("data-stop"),a=s.querySelector(S.slides),y=a?a.childElementCount:0,f=s.querySelector(S.next),d=s.querySelector(S.prev),r=s.querySelector(S.pagination),i=a?a.scrollWidth:0,h=a?a.innerHTML:"",p=null,w=null,z=!1;if(!f&&!d&&!A&&!u&&!L)return;if(!document.body.contains(s)||!a)return;var Y=()=>{var v=s.getBoundingClientRect();return v.bottom>=0&&v.top<=(window.innerHeight||document.documentElement.clientHeight)},R=(v,M)=>{var H=A?y:0;if(!a)return;if(v==="next")a.scrollBy(s.offsetWidth,0);else if(v==="prev")a.scrollBy(-a.offsetWidth,0);else a.scrollTo({left:a.children[parseFloat(v.toString())+H].offsetLeft,behavior:M?"instant":"smooth"})},c=()=>{if(w)clearInterval(w),w=null;if(L&&document.body.contains(s))w=setTimeout(()=>{if(Y()){var v=u==="action"&&(s.querySelector("a:hover")||s.querySelector("button:hover")),M=u==="hover"&&s.matches(":hover");if(!v&&!M)R("next")}c()},L)};if(f)f.addEventListener("click",()=>{R("next")});if(d)d.addEventListener("click",()=>{R("prev")});if(r&&!r.childNodes.length&&a&&y)for(let v=0;v<y;v++){let M=document.createElement("button");if(v===0)M.classList.add("active");M.onclick=()=>{if(R(v),r&&r.children)Array.from(r.children).forEach((H)=>{H.classList.remove("active")});M.classList.add("active")},r.append(M)}if(a.addEventListener("scroll",()=>{if(s.setAttribute("data-sliding",""),s.removeAttribute("data-position"),p)clearTimeout(p);if(w)clearInterval(w),w=null;p=setTimeout(function(){if(s.removeAttribute("data-sliding"),c(),A&&a){var v=a.scrollWidth/3;if(a.scrollLeft<v){var M=v-a.scrollLeft;a.scrollTo({left:v*2-M,behavior:"instant"})}if(a.scrollLeft>=v*2){var M=a.scrollLeft-v*2;a.scrollTo({left:v+M,behavior:"instant"})}}else if(a){if(!a.scrollLeft)s.setAttribute("data-position","start");else if(a.scrollLeft+s.offsetWidth>=a.scrollWidth-2)s.setAttribute("data-position","end")}s.querySelectorAll(".slider-slides > *").forEach((q)=>{q.removeAttribute("data-first"),q.removeAttribute("data-last");var N=Math.round(q.getBoundingClientRect().left-s.getBoundingClientRect().left);q.toggleAttribute("data-showing",N>=0&&N<s.clientWidth)});var H=s.querySelectorAll("[data-showing]");if(H.length){if(r&&a){r.querySelectorAll(".active").forEach((q)=>{q.classList.remove("active")});var x=Array.from(a.children).indexOf(H[0]);if(A)x=x===y*2?0:x-y;if(x!==void 0)r.children[x].classList.add("active")}H[0].setAttribute("data-first",""),H[H.length-1].setAttribute("data-last","");var Q=function(q,N,P){var V=0,W=[];if(!q)return;while(q=N==="next"?q.nextSibling:q.previousSibling){if(V>=P||!q.nodeType||q.nodeType===3)continue;var K=q.getAttribute("loading");if(q.tagName==="IMG"&&K&&K.toLowerCase()==="lazy")W.push(q.src);else q.querySelectorAll('img[loading="lazy"]').forEach((F)=>{W.push(F.src)});V++}W.forEach((F)=>{var T=new Image;T.src=F})};Q(s.querySelector("[data-last]"),"next",H.length),Q(s.querySelector("[data-last]"),"prev",H.length)}},100)}),A)a.innerHTML+=h+h,a.scrollTo({left:i,behavior:"instant"});else a.dispatchEvent(new CustomEvent("scroll")),s.setAttribute("data-position","start");c();var G=()=>{if(!document.body.contains(s)){document.removeEventListener("selectionchange",G);return}if(Y()){var v=document.getSelection();if(v)v=v.toString();if(z&&v){if(w)clearInterval(w),w=null}if(!z&&!v&&!w&&document.body.contains(s))c()}};if(L){if(u==="hover")s.addEventListener("mouseout",()=>{c()}),s.addEventListener("mouseover",()=>{if(w)clearInterval(w),w=null});if(u==="action")document.addEventListener("selectionchange",G),s.addEventListener("selectstart",()=>{z=!0}),s.addEventListener("mouseup",()=>{z=!1})}s.setAttribute("data-loaded","")})}//!
//! SpryJs Toggles Module
window.spryJsTogglers=[];function _(J){let S={...{classOpen:"open",classActive:"active"},...J},s=function(u,a){let y=null,f=!1;if(!u&&a)return[a];if(u&&u instanceof Element)return[u];if(typeof u==="string"){if((u==="next"||u==="hover")&&a&&a.nextElementSibling)return[a.nextElementSibling];if(u==="prev"&&a&&a.previousElementSibling)return[a.previousElementSibling];if(a&&a.parentElement&&u.indexOf("{n}")>-1){var d=Array.from(a.parentElement.children).indexOf(a);u=u.replaceAll("{n}",(d+1).toString())}if(a&&u.indexOf("{")>-1&&u.indexOf("}")>0){if(y=a.closest(u.substring(u.indexOf("{")+1,u.indexOf("}"))),y){let i="";if(y.hasAttribute("id"))i=y.getAttribute("id")||"";else i="id-"+(Math.random()+1).toString(36).substring(2),y.setAttribute("id",i),f=!0;u="#"+i+u.substring(u.indexOf("}")+1)}}var r=document.querySelectorAll(u);if(y&&f)y.removeAttribute("id");if(r)return Array.from(r)}return[]},L=function(u,a,y){let f=!1,d=[];for(let i of window.spryJsTogglers)if(i.el&&u===i.el){if(i.timer)clearTimeout(i.timer);if(i.closeSelector==="")if(i.el.classList.contains(S.classOpen)){if(y&&y.target===i.el)i.el.classList.remove(S.classOpen),i.el.setAttribute("aria-expanded","false"),d.push(i.el),f=!1}else{var r=i.el.closest("."+S.classOpen);if(r)r.classList.remove(S.classOpen),r.setAttribute("aria-expanded","false"),d.push(r),f=!1}if(i.closeSelector)s(i.closeSelector,u).forEach((h)=>{h.classList.remove(S.classOpen),h.setAttribute("aria-expanded","false"),d.push(h),f=!1});if(i.toggleSelector&&(!a||a==="toggle"))s(i.toggleSelector,u).forEach((h)=>{h.classList.toggle(S.classOpen),h.toggleAttribute("aria-expanded"),f=h.classList.contains(S.classOpen)?!0:!1,d.push(h)});if(i.openSelector&&(!a||a==="open"))s(i.openSelector,u).forEach((h)=>{h.classList.add(S.classOpen),h.setAttribute("aria-expanded","true"),d.push(h),f=!0});if(i.el.toggleAttribute("aria-pressed",f),i.el.classList.toggle(S.classActive,f),f&&i.timeout&&i.timeout>0)i.timer=setTimeout(()=>{if(i.toggleSelector)L(i.el)},i.timeout)}window.spryJsTogglers.forEach((i)=>{if(i.closeSelector)s(i.closeSelector,i.el).forEach((h)=>{d.forEach((p)=>{if(p===h)i.el.toggleAttribute("aria-pressed",!1),i.el.classList.toggle(S.classActive,!1)})});if(i.toggleSelector)s(i.toggleSelector,i.el).forEach((h)=>{d.forEach((p)=>{if(p===h)f=h.classList.contains(S.classOpen)?!0:!1,i.el.toggleAttribute("aria-pressed",f),i.el.classList.toggle(S.classActive,f)})});if(i.openSelector)s(i.openSelector,i.el).forEach((h)=>{d.forEach((p)=>{if(p===h)i.el.toggleAttribute("aria-pressed",!0),i.el.classList.toggle(S.classActive,!0)})})})},A=function(u){var a=u&&u.target instanceof HTMLElement?u.target:null,y=a&&a.tagName?a.tagName:null,f=a&&u.type==="click"?a:null,d=u&&u.type&&u.type==="keyup"&&u instanceof KeyboardEvent&&u.code&&u.code==="Escape";if(!u||f||d)window.spryJsTogglers.forEach((r)=>{if((r.dismissible||r.escapable&&d)&&r.el&&r.el!==f&&!r.el.contains(f)&&r.toggleSelector)s(r.toggleSelector,r.el).forEach((i)=>{setTimeout(()=>{if(i===f||i.contains(f)&&(!y||y&&!["A","BUTTON"].includes(y)))return;for(let h of window.spryJsTogglers)if(h.el!==r.el&&(h.el===f||h.el.contains(f))){if(h.closeSelector){for(let p of s(h.closeSelector,h.el))if(p===i)return}if(h.toggleSelector){for(let p of s(h.toggleSelector,h.el))if(p===i)return}if(h.openSelector){for(let p of s(h.openSelector,h.el))if(p===i)return}}if(i.classList.contains(S.classOpen))L(r.el)},20)})})};if(document.querySelectorAll("[data-toggle], [data-toggle-close]").forEach((u)=>{if(u.hasAttribute("data-toggle-loaded"))return;let a=u.getAttribute("data-toggle"),y=u.getAttribute("data-toggle-open"),f=u.getAttribute("data-toggle-close"),d=u.hasAttribute("data-toggle-dismissible"),r=u.hasAttribute("data-toggle-escapable"),i=u.getAttribute("data-toggle-timeout"),h={el:u,toggleSelector:a?a:null,openSelector:y?y:null,closeSelector:f||f===""?f:null,dismissible:d,escapable:r,timeout:i?parseInt(i):0,timer:null};window.spryJsTogglers.push(h),u.addEventListener("click",(p)=>{L(u,"toggle",p)}),u.setAttribute("data-toggle-loaded","")}),!window.spryJsToggleDocListener)document.addEventListener("click",A),document.addEventListener("keyup",A),window.spryJsToggleDocListener=!0}//!
//! SpryJs Query Module
function $(J,B){let S=document.querySelectorAll(J);if(B&&S.length)S.forEach((s)=>{B(s)});return S}//! 
//! Spry Module Exports
var l={loadNavigable:U,loadSliders:Z,loadScrollSpy:X,loadToggles:_,q:$};export{$ as q,_ as loadToggles,Z as loadSliders,X as loadScrollSpy,U as loadNavigable,l as default};
