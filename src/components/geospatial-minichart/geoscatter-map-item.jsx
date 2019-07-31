import React from 'react';
import PropTypes from 'prop-types';
import { CircleMarker } from 'react-leaflet';

import CustomPopup from './custom-popup';

const DEFAULT_STYLES = {
  weight: 1,
  radius: 10,
  fillOpacity: 0.2,
};

// Give a popup to a react-leaflet marker component
// e.g a CircleMarker, Polygon, Polyline, Rectangle
const popupComponent = (ParentComponent, properties) => {
  const props = {
    ...DEFAULT_STYLES,
    ...properties,
  };

  return (
    <ParentComponent
      {...props}
      onMouseOver={e => {
        e.target.openPopup();
      }}
      onMouseOut={e => {
        e.target.closePopup();
      }}
    >
      <CustomPopup {...props} />
    </ParentComponent>
  );
};

popupComponent.propTypes = {
  fields: PropTypes.array,
};

const GeoscatterMapItem = ({ data }) =>
  data.map(point => {
    point.key = `${point.center} - ${point.color}`;

    return popupComponent(CircleMarker, point);
  });

GeoscatterMapItem.propTypes = {
  data: PropTypes.array.isRequired,
};

export default GeoscatterMapItem;
export { GeoscatterMapItem, popupComponent };
