import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InfoSprinkle } from 'hadron-react-components';
import pluralize from 'pluralize';

/**
 * The help URLs for things like the Documents tab.
 */
const HELP_URLS = Object.freeze({
  DOCUMENTS: 'https://docs.mongodb.com/compass/master/documents/',
  SCHEMA_SAMPLING: 'https://docs.mongodb.com/compass/current/sampling'
});

/**
 * Component for the sampling message.
 */
class SamplingMessage extends Component {
  static displayName = 'SamplingMessageComponent';

  static propTypes = {
    sampleSize: PropTypes.number.isRequired
  }

  _openLink(link) {
    const { shell } = require('electron');
    shell.openExternal(link);
  }

  /**
   * If we are on the schema tab, the smapling message is rendered.
   *
   * @returns {React.Component} The sampling message.
   */
  render() {
    const sampleSize = this.props.sampleSize;
    const documentsNoun = pluralize('document', sampleSize);

    return (
      <div className="sampling-message">
        This report is based on a sample of&nbsp;<b>{sampleSize}</b>&nbsp;{documentsNoun}.
        <InfoSprinkle
          helpLink={HELP_URLS.SCHEMA_SAMPLING}
          onClickHandler={this._openLink.bind(this)}
        />
      </div>
    );
  }
}

export default SamplingMessage;
