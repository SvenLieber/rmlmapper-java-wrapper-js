/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const assert = require('assert');
const fs = require('fs');
const RMLMapperWrapper = require('./lib/wrapper');
const { strToQuads } = require('./lib/utils');
const { isomorphic } = require("rdf-isomorphic");
const N3 = require('n3');

const rmlmapperPath = './rmlmapper.jar';
const tempFolderPath = './tmp';

describe('Success', function() {
  this.timeout(5000);

  it('Simple CSV mapping', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
  });

  it('Simple CSV mapping with metadata', async () => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
    };

    // WHEN generating the quads without the metadata and expected the results to by an array of quads
    const result = await wrapper.execute(rml, {sources, generateMetadata: true, asQuads: true});

    // THEN the mapping should succeed and the output should match one of the file
    const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
    assert.ok(isomorphic(result.output, expected));
    assert.ok(result.metadata.length > 0);
  });

  it('Invalid mapping', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc02/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc02/student.csv', 'utf-8')
    };

    let error;

    try {
      await wrapper.execute(rml, {sources, generateMetadata: false, asQuads: true});
    } catch (err) {
      error = err;
    }

    assert.strictEqual(error === null, false);
    assert.strictEqual(error.message, `Error while executing the rules.`);
    assert.strictEqual(error.log.indexOf('No Triples Maps found.') !== -1, true);
  });

  it('Serialization: JSON-LD', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc03/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc03/student.csv', 'utf-8')
    };

    const result = await wrapper.execute(rml, {sources, serialization: 'jsonld'});

    let error = null;

    try {
      JSON.parse(result.output);
    } catch (err) {
      error = err;
    }

    assert.ok(error === null);
  });

  it('Serialization: undefined', async () => {
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc03/mapping.ttl', 'utf-8');
    const sources = {
      'student.csv': fs.readFileSync('./test/tc03/student.csv', 'utf-8')
    };

    let error = null;

    try {
      await wrapper.execute(rml, {sources});
    } catch (err) {
      error = err;
    }

    assert.ok(error === null);
  });

  it('Input: array of quads', done => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true);
    const rml = fs.readFileSync('./test/tc01/mapping.ttl', 'utf-8');
    const parser = new N3.Parser();
    const rmlQuads = [];

    parser.parse(rml, async (error, quad) => {
      if (quad) {
        rmlQuads.push(quad);
      } else {
        const sources = {
          'student.csv': fs.readFileSync('./test/tc01/student.csv', 'utf-8')
        };

        // WHEN generating the quads without the metadata and expected the results to by an array of quads
        const result = await wrapper.execute(rmlQuads, {sources, generateMetadata: false, asQuads: true});

        // THEN the mapping should succeed and the output should match one of the file
        const expected = await strToQuads(fs.readFileSync('./test/tc01/output.nq', 'utf-8'));
        assert.ok(isomorphic(result.output, expected));
        done();
      }
    });
  });

  it('Add Java VM options', done => {
    // GIVEN a wrapper and a simple CSV mapping generating one quad
    const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, true, {'Dfile.encoding': 'UTF-8'});
    const rml = fs.readFileSync('./test/tc04/mapping.ttl', 'utf-8');
    const parser = new N3.Parser();
    const rmlQuads = [];

    parser.parse(rml, async (error, quad) => {
      if (quad) {
        rmlQuads.push(quad);
      } else {
        const sources = {
          'student.csv': fs.readFileSync('./test/tc04/student.csv', 'utf-8')
        };

        // WHEN generating the quads without the metadata and expected the results to by an array of quads
        const result = await wrapper.execute(rmlQuads, {sources, generateMetadata: false, asQuads: true});

        // THEN the mapping should succeed and the output should match one of the file
        const expected = await strToQuads(fs.readFileSync('./test/tc04/output.nq', 'utf-8'));
        assert.ok(isomorphic(result.output, expected));
        done();
      }
    });
  });
});
