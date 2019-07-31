const DEFAULT_RADIUS_RANGE = [6, 26];

const HEATMAP_DEFAULTS = {
  blur: 25,
  radius: 30,
  opacity: 100,
};

const SCATTER_DEFAULTS = {
  opacity: 10,
  strokeThickness: 1,
};

const ALLOWED_ATTRIBUTION_TAGS = [
  'a',
  'p',
  'i',
  'b',
  'strong',
  'span',
  'pre',
  'code',
  'em',
  's',
  'small',
  'sub',
  'sup',
  'time',
  'u',
];

const CHOROPLETH_DEFAULTS = {
  opacity: 100,
};

const GEOSPATIAL_COLOR_DEFAULTS = {
  'Geospatial Choropleth': {
    color: 'yellowgreenblue',
    reverse: false,
  },
  'Geospatial Heatmap': {
    color: 'rainbow',
    reverse: false,
  },
};

const GLOBE_BOUNDS = [[-90, -180], [90, 180]];

const MAP_TOPOJSON_PRESETS = {
  WORLD_COUNTRIES: 'Countries and Regions',
  AU_STATES: 'Australian States',
  AU_LGA: 'Australian LGAs',
  CA_PROVINCES: 'Canadian Provinces',
  DE_STATES: 'German States',
  UK_COUNTRIES: 'UK Countries',
  UK_COUNTIES: 'UK Counties and Districts',
  US_STATES: 'US States',
};

// Each choropleth topoJSON type
const CHOROPLETH_TOPOJSON_TYPES = [
  {
    name: MAP_TOPOJSON_PRESETS.US_STATES,
    filename: 'us-states.json',
    properties: ['name', 'code'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.AU_STATES,
    filename: 'aus-states.json',
    properties: ['name', 'code'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.AU_LGA,
    filename: 'aus-lga.json',
    properties: ['name'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.CA_PROVINCES,
    filename: 'ca-provinces.json',
    properties: ['name', 'name-fr', 'code'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.DE_STATES,
    filename: 'de-states.json',
    properties: ['name', 'name_en', 'code'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.UK_COUNTRIES,
    filename: 'uk-countries.json',
    properties: ['name'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.UK_COUNTIES,
    filename: 'uk-counties.json',
    properties: ['name'],
  },
  {
    name: MAP_TOPOJSON_PRESETS.WORLD_COUNTRIES,
    filename: 'world-countries.json',
    properties: ['name', 'Alpha-2', 'alt-1', 'alt-2'],
  },
];

const CHOROPLETH_ZERO_STATE_MESSAGE = {
  title: 'No Locations Found',
  subtitle: `No values from the Location channel could be mapped to known regions.
    Try selecting a different Shape on the Customization tab.`,
};

// The precision of the key in the choropleth gradient object
// This is needed to avoid floating point rounding errors
const CHOROPLETH_GRADIENT_PRECISION = 12;

// Bounds are set around the US
const DEFAULT_LATLNG_BOUNDS = [
  [49.393816, -126.358703],
  [16.332793, -68.518552],
];

// If no tile server is provided, use this url instead.
const DEFAULT_TILE_URL =
  'https://compass-maps.mongodb.com/compass/maptile/{z}/{x}/{y}';

// The copyright url for HERE maps, if we're using the default tile url
const COPYRIGHT_URL = 'https://compass-maps.mongodb.com/compass/copyright';

const CHART_CATEGORIES = {
  BAR: 'bar',
  COLUMN: 'column',
  LINE: 'line',
  AREA: 'area',
  GRID: 'grid',
  CIRCULAR: 'circular',
  TEXT: 'text',
  GEOSPATIAL: 'geospatial',
};

const CHART_CATEGORIES_ICONS = {
  [CHART_CATEGORIES.AREA]: 'area-discrete',
  [CHART_CATEGORIES.BAR]: 'bar-grouped',
  [CHART_CATEGORIES.COLUMN]: 'column-grouped',
  [CHART_CATEGORIES.LINE]: 'line-discrete',
  [CHART_CATEGORIES.GRID]: 'heatmap',
  [CHART_CATEGORIES.TEXT]: 'data-table',
  [CHART_CATEGORIES.CIRCULAR]: 'donut',
  [CHART_CATEGORIES.GEOSPATIAL]: 'geo-choropleth',
};

const _SCATTER_DEFAULTS = {
  DEFAULT_RADIUS_RANGE,
  HEATMAP_DEFAULTS,
  SCATTER_DEFAULTS,
  ALLOWED_ATTRIBUTION_TAGS,
  CHOROPLETH_DEFAULTS,
  GLOBE_BOUNDS,
  CHOROPLETH_TOPOJSON_TYPES,
  CHOROPLETH_ZERO_STATE_MESSAGE,
  CHOROPLETH_GRADIENT_PRECISION,
  MAP_TOPOJSON_PRESETS,
  GEOSPATIAL_COLOR_DEFAULTS,
  DEFAULT_LATLNG_BOUNDS,
  DEFAULT_TILE_URL,
  COPYRIGHT_URL,
};

export { _SCATTER_DEFAULTS as SCATTER_DDEFAILTS, CHART_CATEGORIES, CHART_CATEGORIES_ICONS };
