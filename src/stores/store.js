import util from 'util';

import Reflux from 'reflux';
import ipc from 'hadron-ipc';
import StateMixin from 'reflux-state-mixin';
import toNS from 'mongodb-ns';
import { addLayer, generateGeoQuery } from 'modules/geo';

import mongodbSchema from 'mongodb-schema';
const analyzeDocuments = util.promisify(mongodbSchema);

const debug = require('debug')('mongodb-compass:stores:schema');

const DEFAULT_MAX_TIME_MS = 60000;
const DEFAULT_SAMPLE_SIZE = 1000;

function getErrorState(err) {
  const errorMessage = (err && err.message) || 'Unknown error';

  let samplingState;

  if (errorMessage.match(/operation exceeded time limit/)) {
    samplingState = 'timeout';
  } else if (errorMessage.match(/operation was interrupted/)) {
    samplingState = 'initial';
  } else {
    samplingState = 'error';
  }

  return { samplingState, errorMessage };
}

/**
 * Set the data provider.
 *
 * @param {Store} store - The store.
 * @param {Error} error - The error (if any) while connecting.
 * @param {Object} provider - The data provider.
 */
export const setDataProvider = (store, error, provider) => {
  if (!error) {
    store.dataService = provider;
  }
};

/**
 * Set the namespace in the store.
 *
 * @param {Store} store - The store.
 * @param {String} ns - The namespace in "db.collection" format.
 */
export const setNamespace = (store, ns) => {
  const namespace = toNS(ns);
  if (namespace.collection) {
    store.ns = ns;
  }
};

/**
 * Set the global app registry.
 *
 * @param {Store} store - The store.
 * @param {AppRegistry} appRegistry - The app registry.
 */
export const setGlobalAppRegistry = (store, appRegistry) => {
  store.globalAppRegistry = appRegistry;
};

/**
 * Set the local app registry.
 *
 * @param {Store} store - The store.
 * @param {AppRegistry} appRegistry - The app registry.
 */
export const setLocalAppRegistry = (store, appRegistry) => {
  store.localAppRegistry = appRegistry;
};

/**
 * Configure a store with the provided options.
 *
 * @param {Object} options - The options.
 *
 * @returns {Store} The reflux store.
 */
const configureStore = (options = {}) => {
  /**
   * The reflux store for the schema.
   */
  const store = Reflux.createStore({

    mixins: [StateMixin.store],
    listenables: options.actions,

    /**
     * Initialize the document list store.
     */
    init: function() {
      this.query = {
        filter: {},
        project: null,
        limit: DEFAULT_SAMPLE_SIZE,
        maxTimeMS: DEFAULT_MAX_TIME_MS
      };
      this.ns = '';
      this.geoLayers = {};
      this.isSampling = false;
    },

    getShareText() {
      if (this.state.schema !== null) {
        return `The schema definition of ${this.ns} has been copied to your clipboard in JSON format.`;
      }
      return 'Please Analyze the Schema First from the Schema Tab.';
    },

    handleSchemaShare() {
      const { remote } = require('electron');
      const clipboard = remote.clipboard;

      clipboard.writeText(JSON.stringify(this.state.schema, null, '  '));
      ipc.call('app:show-info-dialog', 'Share Schema', this.getShareText());
    },

    /**
     * Initialize the schema store.
     *
     * @return {Object} initial schema state.
     */
    getInitialState() {
      return {
        localAppRegistry: null,
        globalAppRegistry: null,
        samplingState: 'initial',
        errorMessage: '',
        schema: null
      };
    },

    onQueryChanged: function(state) {
      this.query.filter = state.filter;
      this.query.limit = state.limit;
      this.query.project = state.project;
      this.query.maxTimeMS = state.maxTimeMS;
    },

    onSchemaSampled() {
      this.geoLayers = {};

      process.nextTick(() => {
        this.globalAppRegistry.emit(
          'compass:schema:schema-sampled',
          { ...this.state, geo: this.geoLayers }
        );
      });
    },

    geoLayerAdded(field, layer) {
      this.geoLayers = addLayer(field, layer, this.geoLayers);
      this.localAppRegistry.emit('compass:schema:geo-query', generateGeoQuery(this.geoLayers));
    },

    geoLayersEdited(field, layers) {
      layers.eachLayer((layer) => {
        this.geoLayerAdded(field, layer);
      });
    },

    geoLayersDeleted(layers) {
      layers.eachLayer((layer) => {
        delete this.geoLayers[layer._leaflet_id];
      });
      this.localAppRegistry.emit('compass:schema:geo-query', generateGeoQuery(this.geoLayers));
    },

    clearSampling: function() {
      this.isSampling = false;
      this.currentSession = null;
    },

    async stopSampling() {
      const session = this.currentSession;

      if (!this.isSampling) {
        return;
      }

      this.clearSampling();

      if (session) {
        await this.dataService.killSession(session);
      }
    },

    fetchSampleDocuments: async function() {
      const query = this.query || {};

      const sampleSize = query.limit ?
        Math.min(DEFAULT_SAMPLE_SIZE, query.limit) :
        DEFAULT_SAMPLE_SIZE;

      const sampleOptions = {
        query: query.filter,
        size: sampleSize,
        fields: query.project
      };

      this.currentSession = this.dataService.startSession();

      const driverOptions = {
        maxTimeMS: query.maxTimeMS,
        session: this.currentSession
      };

      debug('fetching sample documents',
        {ns: this.ns, sampleOptions, driverOptions}
      );

      return this.dataService.sample(
        this.ns,
        sampleOptions,
        driverOptions
      ).toArray();
    },

    startSampling: async function() {
      try {
        if (this.isSampling) {
          return;
        }

        this.isSampling = true;

        debug('sampling started');

        this.setState({
          samplingState: 'sampling',
          errorMessage: '',
          schema: null
        });

        const docs = await this.fetchSampleDocuments();

        debug('sampling done. analyzing ...');

        this.setState({
          samplingState: 'analyzing',
        });

        const schema = await analyzeDocuments(docs);

        debug('analyzing done');

        this.setState({
          samplingState: 'complete',
          schema: schema
        });

        this.onSchemaSampled();
      } catch (err) {
        this.setState(getErrorState(err));
      } finally {
        this.clearSampling();
      }
    },

    storeDidUpdate(prevState) {
      debug('schema store changed from', prevState, 'to', this.state);
    }
  });

  // Set the app registry if preset. This must happen first.
  if (options.localAppRegistry) {
    /**
     * When the collection is changed, update the store.
     */
    options.localAppRegistry.on('query-changed', (state) => {
      store.onQueryChanged(state);
    });

    /**
     * When `Share Schema as JSON` clicked in menu show a dialog message.
     */
    options.localAppRegistry.on('menu-share-schema-json', store.handleSchemaShare);

    setLocalAppRegistry(store, options.localAppRegistry);
  }

  // Set global app registry to get status actions.
  if (options.globalAppRegistry) {
    setGlobalAppRegistry(store, options.globalAppRegistry);
  }

  // Set the data provider - this must happen second.
  if (options.dataProvider) {
    setDataProvider(
      store,
      options.dataProvider.error,
      options.dataProvider.dataProvider
    );
  }

  // Set the namespace - must happen third.
  if (options.namespace) {
    setNamespace(store, options.namespace);
  }

  return store;
};

export default configureStore;
