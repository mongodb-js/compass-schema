/* eslint-disable react/sort-comp */
/* eslint-disable quotes */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import { Map, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility";

import GeoscatterMapItem from "./marker";

import { DEFAULT_TILE_URL } from "./constants";
import { getHereAttributionMessage } from "./utils";

// const SELECTED_COLOR = '#F68A1E';
const UNSELECTED_COLOR = '#43B1E5';
// const CONTROL_COLOR = '#ed271c';

/**
 * Fetches the tiles from the compass maps-proxy
 * and attaches the attribution message to the
 * map.
 * @param {react-leaflet.Map} map The rendered component ref.
 */
const attachAttribution = async function(map) {
  let attributionMessage = "";
  if (map) {
    const bounds = map.leafletElement.getBounds();
    const level = map.leafletElement.getZoom();

    attributionMessage = await getHereAttributionMessage(bounds, level);
  }
  return attributionMessage;
};

/**
 * Cast `bson.Double` or `bson.Int32` to `Number`.
 * @param {Array<bson.Double>} values
 * @returns {Array<Number>}
 */
const bsonToLatLong = (values) => {
  return values.map((v) => v.valueOf());
};

/**
 * Transforms an array `[lat,long]` coordinates into a GeoJSON Point.
 * @param {Array} values
 * @returns {Object}
 */
const valueToGeoPoint = values => {
  const latLong = bsonToLatLong(values);
  const point = {
    type: "Point",
    coordinates: latLong,
    center: latLong,
    color: UNSELECTED_COLOR,
    /**
     * Passed to `<CustomPopup />`
     */
    fields: [
      {
        key: "Location",
        value: latLong.toString()
      }
    ]
  };
  return point;
};

/**
 * Example `type` prop:
 * 
 * ```
 * {
 *   name: 'Boolean',
 *   count: 1,
 *   probability: 0.25,
 *   unique: 1,
 *   values: [true]
 * }
 * ```
 */

 // From charts geospatial map-item

class CoordinatesMinichart extends PureComponent {
  static displayName = 'CoorddinatesMinichart';
  static propTypes = {
    _id: PropTypes.string,
    type: PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      probability: PropTypes.number.isRequired,
      unique: PropTypes.number,
      values: PropTypes.array
    }),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fieldName: PropTypes.string.isRequired
  };

  state = {
    ready: false,
    attributionMessage: ""
  };

  componentDidMount() {
    this.fitMapBounds();
  }

  /**
   * Ensures bson `[lat, long]` pair matches leaflet types.
   * TODO: lucas - move to state.
   *
   * @returns {Array<Number>}
   */
  getLatLongPairs() {
    return this.props.type.values.map(bsonToLatLong);
  }

  /**
   * Sets a map view that contains the given geographical bounds
   * with the maximum zoom level possible.
   */
  fitMapBounds() {
    const { map } = this.refs;
    if (!map) {
      return;
    }

    const leaflet = this.refs.map.leafletElement;
    const bounds = this.getLatLongPairs();

    /**
     * If no values (e.g. empty query result),
     * don't draw the map?
     */
    if (bounds.length === 0) {
      return;
    }

    /**
     * Need at least 2 points for map level bounds.
     */
    if (bounds.length === 1) {
      leaflet.setView(bounds[0], 3); // zoom ~continent level
      return;
    }

    leaflet.fitBounds(bounds);
  }

  componentDidUpdate() {
    this.fitMapBounds();
    this.invalidateMapSize();
  }

  whenMapReady() {
    if (this.state.ready) {
      return;
    }

    this.getTileAttribution();
    this.setState({ ready: true }, this.invalidateMapSize);
  }

  async getTileAttribution() {
    if (this.state.attributionMessage !== "") {
      return;
    }
    
    const { map } = this.refs;
    const attributionMessage = await attachAttribution(map);
    this.setState({ attributionMessage });
  }

  invalidateMapSize() {
    const { map } = this.refs;
    if (!map) {
      return;
    }

    map.container.style.height = `${this.props.height}px`;
    map.container.style.width = `${this.props.width}px`;
    map.leafletElement.invalidateSize();
  }

  /**
   * Render child markers for each value in the schema.
   * TODO: lucas - if !unique, included # of docs in the
   * sample with this value.
   *
   * @returns {react.Component}
   */
  renderMapItems() {
    const { values } = this.props.type;

    if (values.length === 0) {
      return null;
    }

    const geopoints = values.map(value => {
      const v = valueToGeoPoint(value);
      v.fields[0].key = this.props.fieldName;
      return v;
    });

    return <GeoscatterMapItem data={geopoints} />;
  }

  /**
   * Values plotted to a leaftlet.js map with attribution
   * to our current map provider, HERE.
   * @returns {React.Component}
   */
  render() {
    const { attributionMessage } = this.state;
    return (
      <Map
        whenReady={this.whenMapReady.bind(this)}
        ref="map"
        onMoveend={this.getTileAttribution.bind(this)}
      >
        {this.renderMapItems()}
        <TileLayer url={DEFAULT_TILE_URL} attribution={attributionMessage} />
      </Map>
    );
  }
}

export default CoordinatesMinichart;
export { CoordinatesMinichart };
