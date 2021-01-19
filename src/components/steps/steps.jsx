import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for the entire document list.
 */
class SchemaSteps extends Component {
  static displayName = 'SchemaStepsComponent';

  static propTypes = {
    samplingState: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired
  }

  onStopClicked() {
    this.props.actions.stopSampling();
  }

  renderStopButton() {
    if (this.props.samplingState !== 'sampling') {
      return;
    }

    return (
      <div className="buttons">
        <div id="buttons-waiting">
          <button
            className="btn btn-sm btn-info"
            onClick={this.onStopClicked.bind(this)}>
            Stop
          </button>
        </div>
      </div>
    );
  }

  render() {
    const iconClassName = 'fa fa-fw fa-spin fa-circle-o-notch';
    const text = this.props.samplingState === 'sampling' ?
      'Sampling Collection' : 'Analyzing Documents';
    return (
      <div>
        <ul className="steps">
          <li id="sampling-step">
            <i className={iconClassName} />
            {text}
          </li>
        </ul>
        {this.renderStopButton()}
      </div>
    );
  }
}

export default SchemaSteps;
