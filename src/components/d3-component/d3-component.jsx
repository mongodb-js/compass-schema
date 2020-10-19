/* eslint-disable valid-jsdoc */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import bson from 'bson';
import { assign } from 'lodash';

/**
 * Convert back to BSON types from the raw JS.
 */
const TO_BSON_CONVERSIONS = {
  'Long': (value) => bson.Long.fromNumber(value),
  'Decimal128': (value) => bson.Decimal128.fromString(value),
  'Date': (value) => new Date(value),
  'UtcDatetime': (value) => new Date(value),
  'ObjectId': (value) => bson.ObjectId.createFromHexString(value)
};

/**
 * Default conversion.
 */
const DEFAULT = (value) => { return value; };

class D3Component extends Component {
  static displayName = 'D3Component';

  static propTypes = {
    fieldName: PropTypes.string.isRequired,
    type: PropTypes.object.isRequired,
    localAppRegistry: PropTypes.object.isRequired,
    renderMode: PropTypes.oneOf(['svg', 'div']),
    width: PropTypes.number,
    height: PropTypes.number,
    fn: PropTypes.func.isRequired,
    query: PropTypes.any
  }

  constructor(props) {
    super(props);
    this.state = { chart: null };
  }

  componentWillMount() {
    this.setState({
      chart: this.props.fn(this.props.localAppRegistry)
    });
  }

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }

  componentWillUnmount() {
    this._cleanup();
  }

  _getContainer() {
    let options = {
      className: 'minichart',
      ref: 'container'
    };
    const sizeOptions = {
      width: this.props.width,
      height: this.props.height
    };
    if (this.props.renderMode === 'svg') {
      options = assign(options, sizeOptions);
      return (
        <svg {...options}>
          <defs>
            <pattern id="diagonal-stripes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2.5" height="4" transform="translate(0,0)" fill="white"></rect>
            </pattern>
            <mask id="mask-stripe">
              <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonal-stripes)"></rect>
            </mask>
          </defs>
        </svg>
      );
    }
    options = assign(options, {
      style: sizeOptions
    });
    return <div {...options}></div>;
  }

  _cleanup() {
    if (this.state.chart) {
      this.state.chart.cleanup();
    }
  }

  _redraw() {
    const el = ReactDOM.findDOMNode(this.refs.container);
    this.state.chart
      .width(this.props.width)
      .height(this.props.height);

    // @todo: Durran: add the original type here.
    //
    // @todo: Irina: figure out if we need the promoter, since all the values
    // are already converted to acceptable JS values. bson_type can be stored in
    // options as well
    this.state.chart.options({
      fieldName: this.props.fieldName,
      unique: this.props.type.unique || 0,
      query: this.props.query,
      promoter: TO_BSON_CONVERSIONS[this.props.type.bson_type] || DEFAULT
    });

    d3.select(el)
      .datum(this.props.type.values)
      .call(this.state.chart);
  }

  render() {
    const container = this._getContainer();
    return (
      <div className="minichart-wrapper" ref="wrapper">
        {container}
      </div>
    );
  }
}

export default D3Component;
