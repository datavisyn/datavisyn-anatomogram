/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import * as species from './resources/json/svgsForSpecies.json';
import * as idsMap from './resources/json/idsForSvgs.json';

export class Species {
  constructor(public name: string, private file: string, public ids: string[]) {

  }

  load(): Promise<string> {
    return System.import(`raw-loader!./resources/svg/${this.file}`);
  }
}

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
})
