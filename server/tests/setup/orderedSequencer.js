const TestSequencer = require('@jest/test-sequencer').default;

class OrderedSequencer extends TestSequencer {
  sort(tests) {
    return tests.sort((a, b) => a.path.localeCompare(b.path));
  }
}

module.exports = OrderedSequencer;
