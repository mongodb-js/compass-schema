import { Transform } from 'stream';

/**
 * Wraps the schema analyser in a transform stream so
 * we can write the raw data to the parser, and then
 * when finished can get the JSON back.
 */
class Analyser extends Transform {
  /**
   * Create the new analyser.
   *
   * @param {SchemaParser} parser - The wasm schema parser.
   * @param {Object} options - The options.
   */
  constructor(parser, options) {
    super(options);
    this.parser = parser;
  }

  /**
   * Handle writing the input data to the parser.
   *
   * @param {Buffer} chunk - The chunk of raw BSON.
   * @param {String} encoding - The encoding.
   * @param {Function} done - The callback.
   */
  _transform(chunk, encoding, done) {
    try {
      // @todo: Durran: Getting quite a few 'unreachable' errors from the WASM.
      this.parser.writeRaw(chunk);
      done();
    } catch (e) {
      console.error(e);
      done(e);
    }
  }
}

export default Analyser;
