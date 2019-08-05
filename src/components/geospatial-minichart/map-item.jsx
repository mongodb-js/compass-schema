/* eslint-disable valid-jsdoc */
/* eslint-disable react/sort-comp */
/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import has from "lodash.has";
import get from "lodash.get";

import { Map, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"; // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility";

import GeoscatterMapItem from "./geoscatter-map-item";

import { DEFAULT_TILE_URL } from "./constants";
import { getHereAttributionMessage } from "./utils";

const SELECTED_COLOR = '#F68A1E';
const UNSELECTED_COLOR = '#43B1E5';
const CONTROL_COLOR = '#ed271c';

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
 * Configuration options for leaflet.
 */
const LEAFLET_OPTIONS = {
  // center: [-76.4689578, 39.2620277],
  // zoom: 13
};

// /**
//  * Conversion for display in minicharts for non-promoted BSON types.
//  * TODO: lucas Make shared properly with
//  */
// const TO_JS_CONVERSIONS = {
//   'Double': (values) => values.map((v) => v.value),
//   'Int32': (values) => values.map((v) => v.value),
//   'Long': (values) => values.map((v) => v.toNumber()),
//   'Decimal128': (values) => values.map((v) => v.toString())
// };

/**
 * Single doc of what Charts components accept.
 */
const DATA = {
  documents: [
    {
      geopoint: {
        type: "Point",
        coordinates: [-76.4689578, 39.2620277],
        center: [-76.4689578, 39.2620277],
        color: "red",
        fillOpacity: 0.5,
        weight: 1,
        fields: [
          {
            key: "Location",
            value: "[-76.4689578, 39.2620277]"
          }
        ]
      }
    }
  ],
  metadata: {}
};

/**
 * Conversion for display in minicharts for non-promoted BSON types.
 * TODO: lucas - dedupe from d3Component.
 */
const TO_JS_CONVERSIONS = {
  'Double': (v) => v.value,
  'Int32': (v) => v.value,
  'Long': (v) => v.toNumber(),
  'Decimal128': (v) => v.toString()
};

/**
 * TODO: lucas - 2 versions of bson causing values to have _bsontype or _bsonType.
 */

const valuesToLegacyLatLong = (values) => {
  return values.map(function(v) {
    if (!has(v, "_bsontype") && !has(v, "_bsonType")) {
      return v;
    }
    const t = get(v, '_bsontype', get(v, '_bsonType'));
    const primitive = TO_JS_CONVERSIONS[t](v);
    return primitive;
  });
};
/**
 * Transforms an array `[lat,long]` coordinates into a GeoJSON Point.
 */
const valueToGeoPoint = values => {
  const latLong = valuesToLegacyLatLong(values);
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
const TYPE_SHAPE = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  probability: PropTypes.number.isRequired,
  unique: PropTypes.number,
  values: PropTypes.array
};

class MapItem extends PureComponent {
  static displayName = 'MapItemComponent';
  static propTypes = {
    _id: PropTypes.string,
    data: PropTypes.shape({
      documents: PropTypes.array,
      metadata: PropTypes.object
    }),
    spec: PropTypes.object.isRequired,
    type: PropTypes.shape(TYPE_SHAPE),
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fieldName: PropTypes.string.isRequired
  };

  static defaultProps = {
    spec: LEAFLET_OPTIONS,
    data: DATA
  };

  state = {
    ready: false,
    attributionMessage: ""
  };

  componentDidMount() {
    const { map } = this.refs;
    if (!map) {
      return;
    }

    /**
     *  Called on zoom and pan
     */
    map.leafletElement.on("moveend", this.onViewportChanged.bind(this));
    const {
      type: { values }
    } = this.props;


    const latLongs = values.map((v) => valuesToLegacyLatLong(v));
    map.leafletElement.fitBounds(latLongs);
  }

  componentDidUpdate() {
    const { values } = this.props.type;
    const latLongs = values.map((v) => valuesToLegacyLatLong(v));
    const leaflet = this.refs.map.leafletElement;

    // Sets a map view that contains the given geographical bounds with the maximum zoom level possible.
    leaflet.fitBounds(latLongs);
    // leaflet.flyToBounds(latLongs);
    // leaflet.fitWorld();

    this.invalidateMapSize();
  }

  onViewportChanged() {
    // if (!this.state.ready) {
    //   return;
    // }

    // const { map } = this.refs;

    // // if (!this.props.onViewportChanged || !map) {
    // //   return;
    // // }

    // const { viewport } = map;
    // console.log('onViewportChanged', map.viewport);

    // // if (isArray(viewport.center) && isNumber(viewport.zoom)) {
    // //   this.props.onViewportChanged(viewport.center, viewport.zoom);
    // // }
  }

  whenMapReady = () => {
    if (this.state.ready) {
      return;
    }

    this.getTileAttribution();
    this.setState({ ready: true }, this.invalidateMapSize);
  };

  getTileAttribution = async() => {
    const { map } = this.refs;
    if (this.state.attributionMessage === "") {
      const attributionMessage = await attachAttribution(map);
      this.setState({ attributionMessage });
    }
  };

  invalidateMapSize() {
    const { map } = this.refs;
    if (!map) {
      console.error('no map to invalidate?');
      return;
    }

    map.container.style.height = `${this.props.height}px`;
    map.container.style.width = `${this.props.width}px`;
    map.leafletElement.invalidateSize();
  }

  /**
   * Compass only needs `<GeoscatterMapItem />` today.
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

  render() {
    const { attributionMessage } = this.state;
    const { spec } = this.props;
    const { viewport, ...mapProps } = spec;

    // getBoundsZoom(<LatLngBounds> bounds, <Boolean> inside?, <Point> padding?)
    // Returns the maximum zoom level on which the given bounds fit to the map view in its entirety. If inside (optional) is set to true, the method instead returns the minimum zoom level on which the map view fits into the given bounds in its entirety.

    // className='map' style={{height: this.props.height, width: this.props.width}}
    return (
      <Map
        {...mapProps}
        whenReady={this.whenMapReady.bind(this)}
        ref="map"
        onMoveend={this.getTileAttribution}
      >
        {this.renderMapItems()}
        <TileLayer url={DEFAULT_TILE_URL} attribution={attributionMessage} />
      </Map>
    );
  }
}

export default MapItem;
export { MapItem };
