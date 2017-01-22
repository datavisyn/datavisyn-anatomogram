/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import * as species from './resources/json/svgsForSpecies.json';
import * as idsMap from './resources/json/idsForSvgs.json';

export class Species {
  readonly name: string;
  readonly ids: string[];

  constructor(name: string, private file: string, ids: string[]) {
    this.name = name;
    this.ids = ids;
  }

  /**
   * load the underlying svg data
   */
  load(): Promise<string> {
    const basename = this.file.substring(0, this.file.lastIndexOf('.'));
    //!! to a request will disable configured loaders
    return System.import(`!!raw-loader!./resources/svg/${basename}.svg`);
  }
}

/**
 * list of all known species
 * @type {Array}
 */
export const list : Species[]= [];
export default list;

Object.keys(species).forEach((k) => {
  const v = species[k];
  if (typeof v === 'string') {
    list.push(new Species(k, v, idsMap[v]));
  } else {
    Object.keys(v).forEach((kk) => {
      list.push(new Species(`${k}.${kk}`, v[kk], idsMap[v[kk]]));
    });
  }
});
