/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import * as React from 'react';
import Impl, {IAnatomogramOptions, species} from './index';
export {species} from './index';

export interface IAnatomogramProps extends IAnatomogramOptions {
  species: string;
}

function resolveSpecies(s: string) {
  return species.find((d) => d.name === s);
}

/**
 * scatterplot component wrapping the scatterplot implementation
 */
export default class Anatomogram extends React.Component<IAnatomogramProps,{}> {
  static propTypes = {
    species: React.PropTypes.string.isRequired,
    defaultClass: React.PropTypes.string,
    hoverClass: React.PropTypes.string,
    selectClass: React.PropTypes.string
  };

  static defaultProps = {};

  private plot: Impl = null;
  private parent: HTMLDivElement = null;

  constructor(props: IAnatomogramProps, context?: any) {
    super(props, context);
  }

  componentDidMount() {
    //create impl
    this.plot = new Impl(this.parent, resolveSpecies(this.props.species), this.props);
  }

  render() {
    return (
      <div ref={(div) => this.parent = div}>
      </div>
    );
  }
}
