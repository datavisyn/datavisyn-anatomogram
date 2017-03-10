/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import './style.scss';
import {Species} from './data';
import {cssprefix, hoverClass, selectClass, hiddenClass} from './constants';
export {default as species} from './data';
import {defaultsDeep} from 'lodash';
import {patchIds, randomPrefix} from './internal';

export interface IAnatomogramOptions {
  /**
   * default css class for all tissues
   */
  defaultClass?: string;
  /**
   * css class for the currently hovered tissue
   */
  hoverClass?: string;
  /**
   * css class for selected tissues
   */
  selectClass?: string;
  /**
   * map to pass a color for each tissue
   */
  tissueColorMap?: {property: string|number};
  /**
   * on selection change listener
   * @param selections current selection
   */
  onSelectionChanged?(selections: string[]): void;
}

export type AnatomogramTissueElement = SVGElement&SVGStylable;

export interface IImageLoader {
  (fileName: string): Promise<string>;
}

export default class Anatomogram {

  private root: HTMLDivElement;
  /**
   * prefix to patch all ids to support multiple instances without naming conflict
   * @type {string}
   */
  private readonly idPrefix = randomPrefix();

  private options: IAnatomogramOptions = {
    hoverClass,
    selectClass,
    defaultClass: hiddenClass,
    tissueColorMap: null,
    onSelectionChanged: null
  };

  private _tissues: AnatomogramTissueElement[];

  constructor(parent: HTMLElement, private readonly species: Species, private readonly imageLoader: IImageLoader, options?: IAnatomogramOptions) {
    this.options = defaultsDeep(options || {}, this.options);
    this.root = parent.ownerDocument.createElement('div');
    this.root.classList.add(cssprefix);
    parent.appendChild(this.root);
    //this.shadow = (<any>this.root).createShadowRoot();
    this.imageLoader(this.species.fileName).then((svg) => this.build(this.root, patchIds(svg, this.idPrefix)));
  }

  get tissues() {
    return this.species.ids;
  }

  get selections() {
    return this._tissues.filter((e) => e.classList.contains(this.options.selectClass)).map(Anatomogram.toId);
  }

  set selections(value: string[]) {
    this._tissues.forEach((tissue) => {
      const id = Anatomogram.toId(tissue);
      const selected = value.indexOf(id) >= 0;
      if (selected) {
        tissue.classList.add(this.options.selectClass);
      } else {
        tissue.classList.remove(this.options.selectClass);
      }
    });
  }

  get tissueElements() {
    return this._tissues.slice();
  }

  private static toId(tissue: AnatomogramTissueElement) {
    return tissue.getAttribute('data-tissue');
  }

  private hover(tissue: string, hover = true) {
    this.classed(tissue, this.options.hoverClass, hover);
  }

  private select(tissue: string) {
    this.classed(tissue, this.options.selectClass, !this.classed(tissue, this.options.selectClass));
    if (typeof this.options.onSelectionChanged === 'function') {
      this.options.onSelectionChanged(this.selections);
    }
  }

  style(tissue: string, attr: string, value?: string) {
    const elem = this.findElem(tissue);
    if (elem && value !== undefined) {
      elem.style[attr] = value;
    }
    return elem && elem.style[attr];
  }

  classed(tissue: string, clazz: string, enabled?: boolean) {
    const elem = this.findElem(tissue);
    if (elem && enabled !== undefined) {
      if (enabled) {
        elem.classList.add(clazz);
      } else {
        elem.classList.remove(clazz);
      }
    }
    return elem && elem.classList.contains(clazz);
  }

  addClass(tissue: string, ...classes: string[]) {
    const elem = this.findElem(tissue);
    if (elem) {
      elem.classList.add(...classes);
    }
    return false;
  }

  removeClass(tissue: string, ...classes: string[]) {
    const elem = this.findElem(tissue);
    if (elem) {
      elem.classList.remove(...classes);
    }
    return false;
  }

  private findElem(tissue: string) {
    return <AnatomogramTissueElement>this.root.querySelector(`#${this.idPrefix}${tissue}`);
  }

  private build(root: HTMLElement, svg: string) {
    root.innerHTML = svg;
    const svgElem = <SVGSVGElement>this.root.querySelector('svg');
    // set view box for simpler scaling and aspect ratio preservation
    if (!svgElem.hasAttribute('viewBox')) {
      svgElem.setAttribute('viewBox', `0 0 ${parseFloat(svgElem.getAttribute('width'))} ${parseFloat(svgElem.getAttribute('height'))}`);
    }
    // map an initialize tissues
    this._tissues = this.species.ids.map((tissue) => {
      const elem = this.findElem(tissue);
      elem.classList.add(this.options.defaultClass);
      // reset styles
      elem.style.fill = null;
      elem.style.stroke = null;
      elem.setAttribute('data-tissue', tissue);

      if(this.options.tissueColorMap && this.options.tissueColorMap[tissue] !== undefined) {
        const color = this.options.tissueColorMap[tissue];

        if(!isNaN(parseFloat(color)) && typeof parseFloat(color) === 'number') {
          const grayScale: number = Math.floor(parseFloat(color) * 255);
          elem.style.fill = `rgb(${grayScale}, ${grayScale}, ${grayScale})`;
        } else {
          elem.style.fill = color;
        }
      }

      elem.addEventListener('mouseenter', () => {
        this.hover(tissue);
      });
      elem.addEventListener('mouseleave', () => {
        this.hover(tissue, false);
      });
      elem.addEventListener('click', () => {
        this.select(tissue);
      });
      return elem;
    });
  }
}

export function create(parent: HTMLElement, species: Species, options?: IAnatomogramOptions) {
  return new Anatomogram(parent, species, options);
}
