/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import './style.scss';
import {Species} from './data';
import {cssprefix, hoverClass, selectClass, hiddenClass} from './constants';
export {default as species} from './data';
import * as defaultsDeep from 'lodash/defaultsDeep';

export interface IAnatomogramOptions {
  defaultClass?: string;
  hoverClass?: string;
  selectClass?: string;
}

function randomPrefix() {
  return `r${Math.random().toString(36).slice(-8)}_`;
}

function patchIds(svg: string, prefix: string) {
  return svg.replace(/id="(.*)"/gm, `id="${prefix}$1"`);
}

export default class Anatomogram {
  private root: HTMLDivElement;
  private idPrefix = randomPrefix();

  private options: IAnatomogramOptions = {
    hoverClass: hoverClass,
    selectClass: selectClass,
    defaultClass: hiddenClass
  };

  constructor(parent: HTMLElement, private species: Species, options?: IAnatomogramOptions) {
    this.options = defaultsDeep(options || {}, this.options);
    this.root = parent.ownerDocument.createElement('div');
    this.root.classList.add(cssprefix);
    parent.appendChild(this.root);
    //this.shadow = (<any>this.root).createShadowRoot();
    this.species.load().then((svg) => this.build(this.root, patchIds(svg, this.idPrefix)));
  }

  private hover(id: string, hover = true) {
    this.classed(id, this.options.hoverClass, hover);
    console.log(id, hover);
  }

  private select(id: string) {
    this.classed(id, this.options.selectClass, true);
  }

  style(id: string, attr: string, value?: string) {
    const elem = this.findElem(id);
    if (elem && value !== undefined) {
      elem.style[attr] = value;
    }
    return elem && elem.style[attr];
  }

  classed(id: string, clazz: string, enabled?: boolean) {
    const elem = this.findElem(id);
    if (elem && enabled !== undefined) {
      if (enabled) {
        elem.classList.add(clazz);
      } else {
        elem.classList.remove(clazz);
      }
    }
    return elem && elem.classList.contains(clazz);
  }

  addClass(id: string, ...classes: string[]) {
    const elem = this.findElem(id);
    if (elem) {
      elem.classList.add(...classes);
    }
    return false;
  }

  removeClass(id: string, ...classes: string[]) {
    const elem = this.findElem(id);
    if (elem) {
      elem.classList.remove(...classes);
    }
    return false;
  }

  private findElem(id: string) {
    return <SVGElement&SVGStylable>this.root.querySelector(`#${this.idPrefix}${id}`);
  }

  private build(root: HTMLElement, svg: string) {
    root.innerHTML = svg;
    this.species.ids.map((id) => {
      const elem = this.findElem(id);
      elem.classList.add(this.options.defaultClass);
      elem.style.fill = null;
      elem.style.stroke = null;
      elem.addEventListener('mouseenter', () => {
        this.hover(id);
      });
      elem.addEventListener('mouseleave', () => {
        this.hover(id, false);
      });
      elem.addEventListener('click', () => {
        this.select(id);
      });
    });
  }
}

export function create(parent: HTMLElement, species: Species, options?: IAnatomogramOptions) {
  return new Anatomogram(parent, species, options);
}
