const { toFiniteNumber, isBoolish } = require('./shared');

module.exports = function provideAirTransmissionModeValidator({ responseRows }) {
  expect(responseRows.length).toBeGreaterThan(0);

  for (const row of responseRows) {
    expect(row['mount-name']).toBeTruthy();
    expect(row.uuid).toBeTruthy();
    expect(row['local-id']).toBeTruthy();
    expect(row.timestamp).toBeTruthy();
    expect(row['transmission-mode-name']).toBeTruthy();
    expect(row['modulation-scheme-at-lct']).toBeTruthy();

    const timestampMs = Date.parse(row.timestamp);
    expect(Number.isNaN(timestampMs)).toBe(false);

    const symbolRateReductionFactor = toFiniteNumber(row['symbol-rate-reduction-factor']);
    expect(symbolRateReductionFactor).not.toBeNull();
    expect(Number.isInteger(symbolRateReductionFactor)).toBe(true);

    const modulationScheme = toFiniteNumber(row['modulation-scheme']);
    expect(modulationScheme).not.toBeNull();
    expect(modulationScheme).toBeGreaterThan(0);

    const codeRate = toFiniteNumber(row['code-rate']);
    expect(codeRate).not.toBeNull();
    expect(codeRate).toBeGreaterThanOrEqual(0);
    expect(codeRate).toBeLessThanOrEqual(100);

    const channelBandwidth = toFiniteNumber(row['channel-bandwidth']);
    expect(channelBandwidth).not.toBeNull();
    expect(channelBandwidth).toBeGreaterThan(0);

    const capaFactor = toFiniteNumber(row['capa-factor']);
    expect(capaFactor).not.toBeNull();
    expect(capaFactor).not.toBe(0);

    expect(isBoolish(row['xpic-is-avail'])).toBe(true);
  }
};
