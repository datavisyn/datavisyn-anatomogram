/**
 * author:  Samuel Gratzl
 * email:   samuel_gratzl@gmx.at
 * created: 2016-12-07T13:38:55.615Z
 */

import * as React from 'react';
import {IAnatomogramOptions, species, AnatomogramTissueElement} from './index';
export {species} from './index';
import {Species} from './data';
import {patchIds, randomPrefix} from './internal';

export interface IAnatomogramProps extends IAnatomogramOptions {
  species: string;

  selection: string[];

  /**
   * default css class for all tissues
   */
  defaultClass?: string;
  /**
   * css class for selected tissues
   */
  selectClass?: string;
  /**
   * on selection change listener
   * @param selections current selection
   */
  onSelectionChanged?(selections: string[]): void;
}

function resolveSpecies(s: string) {
  return species.find((d) => d.name === s);
}

/**
 * scatterplot component wrapping the scatterplot implementation
 */
export default class Anatomogram extends React.Component<IAnatomogramProps,{loaded: boolean, selection: string[]}> {
  static propTypes = {
    species: React.PropTypes.string.isRequired,
    defaultClass: React.PropTypes.string,
    hoverClass: React.PropTypes.string,
    selectClass: React.PropTypes.string,
    onSelectionChanged: React.PropTypes.func,

  };

  static defaultProps = {};

  private svg: Document;
  private tissues: AnatomogramTissueElement[];
  /**
   * prefix to patch all ids to support multiple instances without naming conflict
   * @type {string}
   */
  private readonly idPrefix = randomPrefix();

  constructor(props: IAnatomogramProps, context?: any) {
    super(props, context);
    this.state = {
      loaded: false,
      selection: props.selection
    };

    this.load();
  }

  private load() {
    const species = resolveSpecies(this.props.species);
    species.load().then((svg) => {
      const parser = new DOMParser();
      this.svg = parser.parseFromString(patchIds(svg, this.idPrefix), 'image/svg+xml');
      this.init(this.svg.rootElement, species);
      this.setState({
        loaded: true,
        selection: this.state.selection
      });
    });
  }

  private init(svg: Element, species: Species) {
    // set view box for simpler scaling and aspect ratio preservation
    if (!svg.hasAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${parseFloat(svg.getAttribute('width'))} ${parseFloat(svg.getAttribute('height'))}`);
    }
    this.tissues = species.ids.map((t) => {
      const tissue = (svg.querySelector(`#${this.idPrefix}${t}`) as AnatomogramTissueElement);

      // reset styles
      tissue.style.fill = null;
      tissue.style.stroke = null;
      tissue.setAttribute('data-tissue', t);
      return tissue;
    });
  }

  render() {
    if (this.state.loaded) {
      this.tissues.forEach((t) => {
        t.className = this.props.defaultClass;
        if (this.state.selection.indexOf(t.getAttribute('data-tissue')) >= 0) {
          t.classList.add(this.props.selectClass);
        }
      });
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(this.svg.documentElement);

      return <div className="datavisyn-anatomogram" onClick={this.onClick.bind(this)}
                  dangerouslySetInnerHTML={{ __html: svgString}}></div>;
    }
    return <div>Loading anatomogram. Please wait...</div>;
  }

  private toggleSelection(tissue: string) {
    const newSelection = this.state.selection.slice();
    const old = newSelection.indexOf(tissue);
    if (old) { //deselect again
      newSelection.splice(old, 1);
    } else {
      newSelection.push(tissue);
    }
    if (this.props.onSelectionChanged) {
      this.props.onSelectionChanged(newSelection);
    }
    this.setState({
      loaded: true,
      selection: newSelection
    });
  }

  private onClick(event: MouseEvent) {
    // use bubbling to capture nested
    const elem = event.target as Element;
    const tissue = elem.getAttribute('data-tissue');
    if (tissue) {
      this.toggleSelection(tissue);
      elem.classList.toggle(this.props.selectClass);
    }
    return false;
  }
}
