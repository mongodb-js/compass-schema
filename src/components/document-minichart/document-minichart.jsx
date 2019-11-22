import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import get from 'lodash.get';

class DocumentMinichart extends Component {
  static displayName = 'DocumentMiniChartComponent';

  static propTypes = {
    nestedDocType: PropTypes.object
  }

  render() {
    let docFieldsMessage = '';
    if (this.props.nestedDocType) {
      const numFields = Object.keys(this.props.nestedDocType.fields).length;
      const nestedFields = pluralize('nested field', numFields, true);
      docFieldsMessage = `Document with ${nestedFields}.`;
    }

    return (
      <div>
        <dl>
          <dt>{docFieldsMessage}</dt>
          <dd></dd>
        </dl>
      </div>
    );
  }
}

export default DocumentMinichart;
