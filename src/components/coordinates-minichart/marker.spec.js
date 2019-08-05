// import React from 'react';
// import { pick } from 'lodash';
// import { shallow } from 'enzyme';

// import { GeoscatterMapItem, popupComponent } from './geoscatter-map-item';

// const FIELDS = [
//   'name',
//   'nameField',
//   'center',
//   'color',
//   'location',
//   'fillOpacity',
//   'weight',
// ];

// const GEOPOINTS = [
//   {
//     center: [30, 12],
//     color: 'red',
//     fillOpacity: 0.5,
//     weight: 1,
//     fields: [
//       {
//         key: 'blah',
//         value: 'blahblah',
//       },
//     ],
//   },
//   {
//     center: [-30.25, 151.112],
//     color: 'blue',
//     fillOpacity: 0.35,
//     weight: 1,
//     fields: [
//       {
//         key: 'baz',
//         value: 'bazbaz',
//       },
//     ],
//   },
//   {
//     center: [23.232, -12.332],
//     color: 'orange',
//     fillOpacity: 0.2,
//     weight: 1,
//     fields: [
//       {
//         key: 'foo',
//         value: 'foofoo',
//       },
//     ],
//   },
// ];

// describe('<GeoscatterMapItem />', function() {
//   describe('#behaviour', function() {
//     it('returns an array of circle markers when given a Point type', function() {
//       // eslint-disable-next-line new-cap
//       const component = GeoscatterMapItem({ data: GEOPOINTS, type: 'Point' });

//       GEOPOINTS.map((d, i) => {
//         expect(component[i].key).to.equal(`${d.center} - ${d.color}`);
//         expect(pick(component[i].props, FIELDS)).to.deep.equal(pick(d, FIELDS));
//       });
//     });
//   });
// });

// describe('<popupComponent />', function() {
//   describe('#behaviour', function() {
//     const onMouseOverStub = sinon.stub();
//     const onMouseOutStub = sinon.stub();

//     const MockMarkerComponent = () => (
//       <div data-test-id="mock-marker-component" />
//     );

//     const fields = [{ key: 'a', value: '10' }];
//     const MockMapItem = () => popupComponent(MockMarkerComponent, { fields });

//     const event = {
//       target: {
//         openPopup: onMouseOverStub,
//         closePopup: onMouseOutStub,
//       },
//     };

//     const component = shallow(<MockMapItem />);

//     it('displays popup on popupComponent hover', function() {
//       component.simulate('mouseOver', event);
//       expect(onMouseOverStub).to.have.been.called;
//     });

//     it('closes popup on popupComponent mouseOut', function() {
//       component.simulate('mouseOut', event);
//       expect(onMouseOutStub).to.have.been.called;
//     });
//   });
// });
