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
  onSelectionChanged?(selections: string[]): void;
}

function randomPrefix() {
  return `r${Math.random().toString(36).slice(-8)}_`;
}

function patchIds(svg: string, prefix: string) {
  return svg.replace(/id="(.*)"/gm, `id="${prefix}$1"`);
}

export type AnatomogramElem = SVGElement&SVGStylable;

export default class Anatomogram {
  private root: HTMLDivElement;
  private idPrefix = randomPrefix();

  private options: IAnatomogramOptions = {
    hoverClass: hoverClass,
    selectClass: selectClass,
    defaultClass: hiddenClass,
    onSelectionChanged: null
  };

  private _elems: AnatomogramElem[];

  constructor(parent: HTMLElement, private species: Species, options?: IAnatomogramOptions) {
    this.options = defaultsDeep(options || {}, this.options);
    this.root = parent.ownerDocument.createElement('div');
    this.root.classList.add(cssprefix);
    parent.appendChild(this.root);
    //this.shadow = (<any>this.root).createShadowRoot();
    this.species.load().then((svg) => this.build(this.root, patchIds(svg, this.idPrefix)));
  }

  get ids() {
    return this.species.ids;
  }

  get selections() {
    return this._elems.filter((e) => e.classList.contains(this.options.selectClass)).map(Anatomogram.toId);
  }

  set selections(value: string[]) {
    this._elems.forEach((elem) => {
      const id = Anatomogram.toId(elem);
      const selected = value.indexOf(id) >= 0;
      if (selected) {
        elem.classList.add(this.options.selectClass);
      } else {
        elem.classList.remove(this.options.selectClass);
      }
    })
  }

  get elems() {
    return this._elems.slice();
  }

  private static toId(elem: AnatomogramElem) {
    return elem.getAttribute('data-id');
  }

  private hover(id: string, hover = true) {
    this.classed(id, this.options.hoverClass, hover);
    console.log(id, hover);
  }

  private select(id: string) {
    this.classed(id, this.options.selectClass, true);
    if (typeof this.options.onSelectionChanged === 'function') {
      this.options.onSelectionChanged(this.selections);
    }
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
    return <AnatomogramElem>this.root.querySelector(`#${this.idPrefix}${id}`);
  }

  private build(root: HTMLElement, svg: string) {
    root.innerHTML = svg;

    // map an initialize elems
    this._elems = this.species.ids.map((id) => {
      const elem = this.findElem(id);
      elem.classList.add(this.options.defaultClass);
      // reset styles
      elem.style.fill = null;
      elem.style.stroke = null;
      elem.setAttribute('data-id', id);
      elem.addEventListener('mouseenter', () => {
        this.hover(id);
      });
      elem.addEventListener('mouseleave', () => {
        this.hover(id, false);
      });
      elem.addEventListener('click', () => {
        this.select(id);
      });
      return elem;
    });
  }
}

export function create(parent: HTMLElement, species: Species, options?: IAnatomogramOptions) {
  return new Anatomogram(parent, species, options);
}
