import Analyser from 'modules/analyser';

describe('Analyser', () => {
  describe('_transform', () => {
    const writeSpy = sinon.spy();
    const parser = {
      writeRaw: writeSpy
    };
    const analyser = new Analyser(parser);

    it('writes to the parser', (done) => {
      analyser._transform('testing', 'UTF-8', () => {
        expect(writeSpy.calledWith('testing')).to.equal(true);
        done();
      });
    });
  });
});
