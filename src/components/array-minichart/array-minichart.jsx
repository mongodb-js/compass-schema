import React, { Component } from 'react';
import PropTypes from 'prop-types';
import min from 'lodash.min';
import max from 'lodash.max';
import pluralize from 'pluralize';
import numeral from 'numeral';

class ArrayMinichart extends Component {
  static displayName = 'ArrayMiniChartComponent';

  static propTypes = {
    type: PropTypes.object.isRequired,
    nestedDocType: PropTypes.object
  }

  render() {
    let arrayOfFieldsMessage = '';
    if (this.props.nestedDocType) {
      const numFields = Object.keys(this.props.nestedDocType.fields).length;
      const nestedFields = pluralize('nested field', numFields, true);
      arrayOfFieldsMessage = `Array of documents with ${nestedFields}.`;
    }

    const minLength = min(this.props.type.lengths);
    const average = this.props.type.lengths
      .reduce((a, b) => a + b, 0) / this.props.type.lengths.length;
    const averageLength = numeral(average).format('0.0[0]');
    const maxLength = max(this.props.type.lengths);

    return (
      <div>
        <dl>
          <dt>{arrayOfFieldsMessage}</dt>
          <dd></dd>
          <dt>Array lengths</dt>
          <dd>
            <ul className="list-inline">
              <li>min: {minLength}</li>
              <li>average: {averageLength}</li>
              <li>max: {maxLength}</li>
            </ul>
          </dd>
        </dl>
      </div>
    );
  }
}

export default ArrayMinichart;
