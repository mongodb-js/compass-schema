import { get } from 'lodash';

import { SCATTER_DEFAULTS, CHART_COLORS, CHART_CATEGORIES } from './constants';

const GeoSpatialScatterRole = {
  name: 'Geospatial Scatter',
  displayName: 'Scatter',
  order: 1,
  flavour: 'geo',
  category: CHART_CATEGORIES.GEOSPATIAL,
  iconValue: 'geo-scatter',
  channels: [
    {
      name: 'geopoint',
      displayName: 'Coordinates',
      required: true,
      channelType: 'geopoint',
      intent: 'geopoint',
      nestedChannels: [
        {
          name: 'longitude',
          displayName: 'Longitude',
          required: true,
          channelType: 'number',
          intent: 'undefined',
        },
        {
          name: 'latitude',
          displayName: 'Latitude',
          required: true,
          channelType: 'number',
          intent: 'undefined',
        },
      ],
    },
    {
      name: 'color',
      displayName: 'Color',
      required: false,
      channelType: 'category',
      intent: 'series',
    },
    {
      name: 'size',
      displayName: 'Size',
      required: false,
      channelType: 'aggregation',
      intent: 'value-axis',
    },
  ],
  specFn: (encodings, customisations) => {
    return {
      customisations: {
        size: get(customisations, 'channels.size'),
      },
      colors:
        get(customisations.options, 'colorDiscrete.value') || CHART_COLORS,
      opacity:
        parseInt(
          get(
            customisations.options,
            'markerOpacity.value',
            SCATTER_DEFAULTS.opacity
          ),
          10
        ) / 100,
      strokeThickness:
        parseInt(
          get(
            customisations.options,
            'strokeThickness.value',
            SCATTER_DEFAULTS.strokeThickness
          ),
          10
        ) * 0.5,
      titles: {
        color: get(encodings, 'color.title'),
        size: get(encodings, 'size.title'),
      },
    };
  },
};

const MAP_ROLES = [
  GeoSpatialScatterRole
];

export { MAP_ROLES, GeoSpatialScatterRole };
