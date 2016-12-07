/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import './style.scss';
import species, {Species} from './data';
export {default as species} from './data';

export interface IAnatomogramOptions {

}

export default class Anatomogram {
  private root: HTMLDivElement;

  constructor(parent: HTMLElement, private species: Species, options?: IAnatomogramOptions) {
    this.root = parent.ownerDocument.createElement('div');
    parent.appendChild(this.root);

    this.species.load().then((svg) => this.build(this.root, svg));
  }

  private build(root: HTMLDivElement, svg: string) {
    root.innerHTML = svg;
  }
}

export function create(parent: HTMLElement, species: Species, options?: IAnatomogramOptions) {
  return new Anatomogram(parent, species, options);
}
