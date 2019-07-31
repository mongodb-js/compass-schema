import React, { forwardRef, Component } from 'react';
import PropTypes from 'prop-types';
import { shallow, mount } from 'enzyme';
import { forEach } from 'lodash';
import { CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_TILE_URL } from './constants';

import MapItem from './map-item';
import MapItemInjector from 'inject-loader!./map-item';

const MockLeafletElement = {
  on: sinon.stub(),
  getBounds: sinon.stub(),
  getZoom: sinon.stub(),
  invalidateSize: sinon.stub(),
  setView: sinon.stub(),
};

class MockMapInner extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.leafletElement = MockLeafletElement;
  }

  render() {
    return <div className="LeafletMap">{this.props.children}</div>;
  }
}

const MockMap = forwardRef((props, ref) => (
  <MockMapInner ref={ref} {...props} />
));

const DATA = {
  documents: [
    {
      geopoint: {
        type: 'Point',
        coordinates: [1, 2],
        center: [1, 2],
        color: 'red',
        fillOpacity: 0.5,
        weight: 1,
        fields: [
          {
            key: 'blah',
            value: undefined,
          },
          {
            key: 'Location',
            value: '1, 2',
          },
        ],
      },
    },
  ],
  metadata: {
    colorFieldName: 'blah',
    colorMapping: {
      undefined: 'red',
    },
  },
};

const VIEWPORT_DATA = {
  spec: {
    viewport: {
      center: [2, 3],
      zoom: 10,
    },
    autoViewport: false,
  },
  data: {
    documents: [],
    metadata: {},
  },
};

const SPEC = {
  opacity: 0.5,
  strokeThickness: 1,
};

describe('<MapItem />', function() {
  let component;
  let getHereAttributionMessageStub;

  beforeEach(function() {
    // reset all the leaflet stubs
    forEach(MockLeafletElement, (_, key) => {
      MockLeafletElement[key] = sinon.stub();
    });

    getHereAttributionMessageStub = sinon
      .stub()
      .returns('Here Attribution msg');

    component = shallow(
      <MapItem data={DATA} spec={SPEC} chartType={'Geospatial Scatter'} />
    );
  });

  afterEach(function() {
    component = null;
    getHereAttributionMessageStub = null;
    forEach(MockLeafletElement, (_, key) => {
      MockLeafletElement[key] = null;
    });
  });

  describe('#behaviour', function() {
    context('leaflet hooks & special props', function() {
      let MockedMapItem;
      beforeEach(function() {
        const context = {
          tileServer: '',
          tileAttributionMessage: '',
        };
        // eslint-disable-next-line new-cap
        MockedMapItem = MapItemInjector({
          'utils/map': {
            getHereAttributionMessage: getHereAttributionMessageStub,
          },
          'constants/contexts': {
            AppContext: React.createContext(context),
          },
          'react-leaflet': {
            Map: MockMap,
            // eslint-disable-next-line react/no-multi-comp
            TileLayer: props => (
              <div data-test-id="LeafletTileLayer" {...props} />
            ),
          },
        }).MapItem;

        MockLeafletElement.getBounds.returns(
          L.LatLngBounds(L.LatLng(1, 2), L.LatLng(2, 3)) // eslint-disable-line new-cap
        );
        MockLeafletElement.getZoom.returns(5);
      });

      describe('leaflet map', function() {
        it('sets Map viewport on mount', function() {
          component = mount(
            <MockedMapItem
              data={DATA}
              spec={VIEWPORT_DATA.spec}
              chartType="don't render"
            />
          );
          const { viewport } = VIEWPORT_DATA.spec;
          expect(MockLeafletElement.setView).calledWith(
            viewport.center,
            viewport.zoom
          );
        });
      });

      describe('tileAttribution', function() {
        context('with an empty AppContext', function() {
          beforeEach(function() {
            component = mount(
              <MockedMapItem data={DATA} spec={SPEC} chartType="don't render" />
            );
          });

          it('should have called the getHereAttributionMessage on whenReady', function() {
            const map = component.childAt(0);
            map.prop('whenReady')();
            expect(getHereAttributionMessageStub).to.have.been.calledWith(
              L.LatLngBounds(L.LatLng(1, 2), L.LatLng(2, 3)), // eslint-disable-line new-cap
              5
            );
          });

          it('should call getHereAttributionMessage onMoveend', function() {
            const map = component.childAt(0);
            MockLeafletElement.getZoom.returns(10);

            // manually call whenReady to get the attribution
            map.prop('whenReady')();

            // manually call `onMoveend` for map
            map.prop('onMoveend')();

            expect(getHereAttributionMessageStub).to.have.been.calledWith(
              L.LatLngBounds(L.LatLng(1, 2), L.LatLng(2, 3)), // eslint-disable-line new-cap
              10
            );
            expect(getHereAttributionMessageStub).to.have.been.calledTwice;
          });
        });

        context('with a defined AppContext', function() {
          beforeEach(function() {
            const context = {
              tileServer: 'http://example.com/{z}/{x}/{y}',
              tileAttributionMessage: 'Manual Message',
            };

            // eslint-disable-next-line new-cap
            const MockedContextMapItem = MapItemInjector({
              'utils/map': {
                getHereAttributionMessage: getHereAttributionMessageStub,
              },
              'constants/contexts': {
                AppContext: React.createContext(context),
              },
              'react-leaflet': {
                Map: MockMap,
                // eslint-disable-next-line react/no-multi-comp
                TileLayer: props => (
                  <div data-test-id="LeafletTileLayer" {...props} />
                ),
              },
            }).MapItem;

            component = mount(
              <MockedContextMapItem
                data={DATA}
                spec={SPEC}
                chartType="don't render"
              />
            );
          });

          it('should use the provided tile attribution message', function() {
            const map = component.childAt(0);
            MockLeafletElement.getZoom.returns(10);
            // manually call whenReady to get the attribution
            map.prop('whenReady')();

            expect(getHereAttributionMessageStub).to.have.not.been.called;
            expect(component.state('attributionMessage')).to.be.equal(
              'Manual Message'
            );
          });
        });
      });

      describe('tilelayer', function() {
        context('with an empty AppContext', function() {
          beforeEach(function() {
            component = mount(
              <MockedMapItem data={DATA} spec={SPEC} chartType="don't render" />
            );
          });

          it('should set the url to DEFAULT_TILE_URL', function() {
            const tileLayer = component.find(
              '[data-test-id="LeafletTileLayer"]'
            );
            expect(tileLayer.prop('url')).to.be.equal(DEFAULT_TILE_URL);
          });
        });

        context('with a defined AppContext', function() {
          beforeEach(function() {
            const context = {
              tileServer: 'http://example.com/{z}/{x}/{y}',
              tileAttributionMessage: 'Manual Message',
            };

            // eslint-disable-next-line new-cap
            const MockedContextMapItem = MapItemInjector({
              'utils/map': {
                getHereAttributionMessage: getHereAttributionMessageStub,
              },
              'constants/contexts': {
                AppContext: React.createContext(context),
              },
              'react-leaflet': {
                Map: MockMap,
                // eslint-disable-next-line react/no-multi-comp
                TileLayer: props => (
                  <div data-test-id="LeafletTileLayer" {...props} />
                ),
              },
            }).MapItem;

            component = mount(
              <MockedContextMapItem
                data={DATA}
                spec={SPEC}
                chartType="don't render"
              />
            );
          });

          it('should use the provided tile server', function() {
            const tileLayer = component.find(
              '[data-test-id="LeafletTileLayer"]'
            );
            expect(tileLayer.prop('url')).to.be.equal(
              'http://example.com/{z}/{x}/{y}'
            );
          });
        });
      });
    });

    it("updating viewport should not change map's saved viewport", function() {
      const spec = {
        ...SPEC,
        gradient: {},
        viewport: { center: [1, 2], zoom: 12 },
      };

      const wrapper = shallow(
        <MapItem data={DATA} spec={spec} chartType={'Geospatial Heatmap'} />
      );

      const newSpec = {
        ...SPEC,
        gradient: {},
        viewport: { center: [3, 3], zoom: 5 },
      };

      wrapper.setState({ ready: true });
      wrapper.setProps({ spec: newSpec });

      const map = wrapper.find('Map');
      expect(map.props().viewport).to.equal(undefined);
    });

    // TODO: lucas: not using heatmaps etc in compass for now.
    // it("updating opacity should change a heatmap's opacity", function() {
    //   const spec = {
    //     ...SPEC,
    //     opacity: 1,
    //     gradient: {},
    //   };

    //   const wrapper = shallow(
    //     <MapItem data={DATA} spec={spec} chartType={'Geospatial Heatmap'} />
    //   );

    //   const newSpec = {
    //     ...SPEC,
    //     opacity: 0.5,
    //     gradient: {},
    //   };

    //   wrapper.setState({ ready: true });

    //   wrapper.setProps({ spec: newSpec });
    //   const heatmap = wrapper.find(GeoheatMapItem);
    //   expect(heatmap.props().opacity).to.deep.equal(newSpec.opacity);
    // });

    it('doesnt set Map bounds when only one document given', function() {
      const map = component.find('Map');

      expect(map.props().bounds).to.be.undefined;
    });

    it('doesnt set Map bounds when given a viewport', function() {
      component.setProps(VIEWPORT_DATA);

      const map = component.find('Map');

      expect(map.props().bounds).to.be.undefined;
    });

    it('sets the state for ready to be true when the Map is ready', function() {
      component.setProps(VIEWPORT_DATA);

      const state = component.state();

      expect(state.ready).to.be.false;

      const map = component.find('Map');

      map.props().whenReady();

      const newState = component.state();

      expect(newState.ready).to.be.true;
    });

    it('sets Map bounds when given it in the spec', function() {
      component.setState({ ready: true });
      component.setProps({
        spec: {
          bounds: [[1, 2], [3, 4]],
        },
      });

      const map = component.find('Map');

      expect(map.props().bounds).to.deep.equal([[1, 2], [3, 4]]);
    });

    it('places a single CircleMarker when given a single point', function() {
      const map = component.find('GeoscatterMapItem').dive();
      const circleMarkers = map.find(CircleMarker);

      expect(circleMarkers.length).to.equal(DATA.documents.length);
    });

    it('places multiple CircleMarkers when given multipe points', function() {
      const NEWDATA = {
        ...DATA,
        documents: [
          ...DATA.documents,
          {
            geopoint: {
              type: 'Point',
              coordinates: [3, 4],
              center: [3, 4],
              color: 'red',
              fillOpacity: 0.5,
              weight: 1,
              fields: [
                {
                  key: 'blah',
                  value: undefined,
                },
                {
                  key: 'Location',
                  value: '3, 4',
                },
              ],
            },
          },
          {
            geopoint: {
              type: 'Point',
              coordinates: [5, 6],
              center: [5, 6],
              color: 'red',
              fillOpacity: 0.5,
              weight: 1,
              fields: [
                {
                  key: 'blah',
                  value: undefined,
                },
                {
                  key: 'Location',
                  value: '5, 6',
                },
              ],
            },
          },
          {
            geopoint: {
              type: 'Point',
              coordinates: [7, 8],
              center: [7, 8],
              color: 'red',
              fillOpacity: 0.5,
              weight: 1,
              fields: [
                {
                  key: 'blah',
                  value: undefined,
                },
                {
                  key: 'Location',
                  value: '7, 8',
                },
              ],
            },
          },
        ],
      };

      const wrapper = shallow(
        <MapItem data={NEWDATA} spec={SPEC} chartType={'Geospatial Scatter'} />
      );

      wrapper.setState({ ready: true });

      const map = wrapper.find('GeoscatterMapItem').dive();
      const circleMarkers = map.find(CircleMarker);

      expect(circleMarkers.length).to.equal(NEWDATA.documents.length);
    });
  });
});
