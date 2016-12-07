/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import './style.scss';
import {Species} from './data';
import {cssprefix} from './constants';
export {default as species} from './data';

export interface IAnatomogramOptions {

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

  constructor(parent: HTMLElement, private species: Species, options?: IAnatomogramOptions) {
    this.root = parent.ownerDocument.createElement('div');
    this.root.classList.add(cssprefix);
    parent.appendChild(this.root);
    //this.shadow = (<any>this.root).createShadowRoot();
    this.species.load().then((svg) => this.build(this.root, patchIds(svg, this.idPrefix)));
  }


  private build(root: HTMLElement, svg: string) {
    root.innerHTML = svg;
  }
}

export function create(parent: HTMLElement, species: Species, options?: IAnatomogramOptions) {
  return new Anatomogram(parent, species, options);
}
