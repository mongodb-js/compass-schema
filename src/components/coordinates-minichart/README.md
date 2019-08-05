
---

# Migrating from MapBox to HERE

##### Assumptions

- Reuse = copy+paste
- Absolute basics, defer everything covered in `later` section below.

## todo

### unplug from mapbox

- [x] get geo dataset setup for testing
- [x] figure out what/where charts geo stuff is
- [x] reuse existing d3 coordinates impl? *Yes for any data transforms. No for d3 bc leaflet has plugin now*
- [x] copy+paste charts js into `compass-schema` as `<GeospatialMinichart />` (sorry) including tests
- [x] hack up `<GeospatialMinichart />` as quickly as possile (double sorry) to get it in
- [x] `<GeospatialMinichart />` imports all working and it builds (inject-loader looks fun)
- [x] test loop until original `<GeospatialMinichart />` passing
- [ ] make a test fixture for `compass-schema` that is a simplified version of the `ships.shipwrecks` dataset
- [ ] tests for `compass-schema` that exercise `<GeospatialMinichart />`
- [ ] data wrangling between `<GeospatialMinichart />` and `<MapItem />`
- [ ] tests that cover data wrangling ➡️ `<MapItem />` correctness
- [ ] Is existing d3 circle lasso reuseable?
- [ ] If not, use `leaflet.draw` and friends to reimplement <kbd>SHIFT</kbd> + <kbd>click & drag</kbd> circle generates `$geoWithin` 

## Notes

### What are we reusing from Charts?

The main entry point we're looking to reuse is [`charts:src/components/geospatial-item/map-item.jsx`](https://github.com/10gen/charts/blob/c9b89a59edb8a711580668a6205470412f7a55e9/src/components/geospatial-item/map-item.jsx).

`< MapItem />` wraps different geo vis variants in Charts, only one of which we'll need for Compass today, [`<GeoscatterMapItem />`](https://github.com/10gen/charts/blob/c9b89a59edb8a711580668a6205470412f7a55e9/src/components/geospatial-item/geoscatter-map-item/geoscatter-map-item.jsx). 

`< MapItem />` uses `<react-leaflet.Map|TileLayer />` components which take [`charts:src/constants/geospatial.js`](https://github.com/10gen/charts/blob/master/src/constants/geospatial.js) for various configs like URL of compass-maps-proxy to use instead of mapbox.

More geospatial related helper functions like loading HERE copyright stuff can be found in [`charts:src/utils/map/`](https://github.com/10gen/charts/tree/efa86864a7a0cef8a85a2e35f6fa39ea3e5f3ab7/src/utils/map).

### contexts

[`charts:src/constants/contexts.js`](https://github.com/10gen/charts/blob/master/src/constants/contexts.js) provides feature flags and allows charts on-prem to [customize the `tileServer` URI via an environment variable](https://github.com/10gen/charts/blob/efa86864a7a0cef8a85a2e35f6fa39ea3e5f3ab7/target/on-prem/cli/commands/startup.js#L123). Compass does not need this functionality today and we don't use contexts anywhere else. All context references are commented out and added to the `later` section for discussion in the future.

### legacy compass mapbox integration

[`compass-schema:src/modules/mapstyle.js`](https://github.com/10gen/compass-schema/blob/c5d911eed3f533090cbf82e011c8fcabe52ee5e6/src/modules/mapstyle.js) looks like it should do something but it isn't accessed and is most likely an orphaned file from the ancient times.

[`compass-schema:src/modules/coordinates.js`](https://github.com/10gen/compass-schema/blob/c5d911eed3f533090cbf82e011c8fcabe52ee5e6/src/modules/coordinates.js) is where mapbox is initialized and used. >90% of this module is the setup and handling for the <kbd>SHIFT</kbd> + <kbd>click & drag</kbd> circle. 

`coordinates.js` has intentionally been commented out but not removed so it can be used as a reference as of July 31, 2019, for:

* Compass user experience implementation
* Communication with the `QueryBar` store

Once the circle lasso functionality is replaced, coordinates.js will be removed. 

Dependencies in package.json removed:

```json
{
    "mapbox-gl": "^0.39.0",
    "turf-destination": "^1.2.1",
    "turf-distance": "^1.1.0",
    "turf-point": "^2.0.1"
}
```

## later

- deep clean geo-related dependencies in `compass-schema`
- deep clean dependencies in `compass` that are geo-related and have just been hanging around thoroughly
- maybe a proper npm module to share common logic with charts
- port/update all other mini charts
- storybook stories for each mini chart type
- `reflux` ➡️ `redux`
- switch from `lodash.*` modules to 1 top-level `lodash`
- revisit context usage