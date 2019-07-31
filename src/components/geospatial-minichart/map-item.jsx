import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { find, isArray, isNumber } from 'lodash';
import { Map, TileLayer } from 'react-leaflet';

import GeoscatterMapItem from './geoscatter-map-item';

// TODO: lucas
// import { AppContext } from 'constants/contexts';
import { DEFAULT_TILE_URL } from './constants';
import { MAP_ROLES, GeoSpatialScatterRole } from './map-types';

import { getHereAttributionMessage } from './utils';

class MapItem extends PureComponent {
  static propTypes = {
    _id: PropTypes.string,
    data: PropTypes.shape({
      documents: PropTypes.array,
      metadata: PropTypes.object,
    }).isRequired,
    spec: PropTypes.object.isRequired,
    chartType: PropTypes.string,
    className: PropTypes.string,
    onViewportChanged: PropTypes.func,
    isResizing: PropTypes.bool,
  };

  static defaultProps = {
    isResizing: false,
  };

  state = {
    ready: false,
    attributionMessage: '',
  };

  componentDidMount() {
    const { map } = this.refs;

    if (map) {
      // Called on zoom and pan
      map.leafletElement.on('moveend', this.onViewportChanged);
      const {
        spec: { viewport },
      } = this.props;

      if (viewport && !this.props.spec.autoViewport) {
        map.leafletElement.setView(viewport.center, viewport.zoom);
      }
    }
  }

  componentDidUpdate() {
    this.invalidateMapSize();
  }

  onViewportChanged = () => {
    if (!this.state.ready) {
      return;
    }

    const { map } = this.refs;

    if (!this.props.onViewportChanged || !map) {
      return;
    }

    const { viewport } = map;

    if (isArray(viewport.center) && isNumber(viewport.zoom)) {
      this.props.onViewportChanged(viewport.center, viewport.zoom);
    }
  };

  onReady = () => {
    if (this.state.ready) {
      return;
    }

    this.getTileAttribution();
    this.setState({ ready: true }, this.invalidateMapSize);
  };

  // eslint-disable-next-line space-before-function-paren
  getTileAttribution = async () => {
    const { tileServer, tileAttributionMessage } = this.context;
    const { map } = this.refs;

    let attributionMessage = tileAttributionMessage;
    if (!tileServer && map) {
      const bounds = map.leafletElement.getBounds();
      const level = map.leafletElement.getZoom();

      attributionMessage = await getHereAttributionMessage(bounds, level);
    }
    this.setState({ attributionMessage });
  };

  invalidateMapSize() {
    const { map } = this.refs;

    if (map) {
      map.leafletElement.invalidateSize();
    }
  }

  // TODO: lucas
  // static contextType = AppContext;

  renderMapItem() {
    /* eslint-disable no-unused-vars */
    const {
      _id,
      chartType,
      data: { documents, metadata },
      spec,
    } = this.props;

    const mapRole = find(MAP_ROLES, { name: chartType });

    const geopoints = documents.map(doc => doc.geopoint);

    switch (mapRole) {
      case GeoSpatialScatterRole:
        return <GeoscatterMapItem data={geopoints} />;
      default:
        return null;
    }
  }

  render() {
    const { tileServer } = this.context;
    const { attributionMessage } = this.state;
    const { spec } = this.props;

    // eslint-disable-next-line no-unused-vars
    const { viewport, ...mapProps } = spec;

    return (
      <Map
        {...mapProps}
        preferCanvas
        whenReady={this.onReady}
        ref="map"
        onMoveend={this.getTileAttribution}
      >
        {this.renderMapItem()}
        <TileLayer
          url={tileServer || DEFAULT_TILE_URL}
          attribution={attributionMessage}
        />
      </Map>
    );
  }
}

export default MapItem;
export { MapItem };
