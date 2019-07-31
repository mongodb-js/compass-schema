import React from 'react';
import { shallow } from 'enzyme';
import { Popup } from 'react-leaflet';

import { CustomPopup, CustomPopupFields } from './custom-popup';

const FIELDS = [
  {
    key: 'k1',
    value: 'v1',
  },
  {
    key: 'k2',
    value: 'v2',
  },
];

describe('<CustomPopup />', function() {
  let component;

  beforeEach(function() {
    component = shallow(<CustomPopup fields={FIELDS} />);
  });

  describe('#rendering', function() {
    it('renders a Popup component', function() {
      expect(component).to.have.type(Popup);
    });
  });

  describe('#behaviour', function() {
    it('does not have a close button', function() {
      const props = component.props();

      expect(props.closeButton).to.be.false;
    });

    it('renders CustomPopupFields as a child element', function() {
      const cf = component.find(CustomPopupFields);
      expect(cf).to.have.type(CustomPopupFields);
    });

    it('renders CustomPopupFields with given fields', function() {
      const cf = component.find(CustomPopupFields);
      expect(cf.props().fields).to.equal(FIELDS);
    });
  });
});
