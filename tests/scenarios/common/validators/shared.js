function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isBoolish(value) {
  return ['true', 'false', '1', '0'].includes(String(value).toLowerCase());
}

function hasValidTimestamp(value) {
  return Number.isNaN(Date.parse(String(value))) === false;
}

function ensureBasicDeviceRow(row) {
  expect(row['mount-name']).toBeTruthy();
  expect(row.timestamp).toBeTruthy();
  expect(hasValidTimestamp(row.timestamp)).toBe(true);
}

function ensureLtpIdentityRow(row) {
  expect(row['mount-name']).toBeTruthy();
  expect(row.uuid).toBeTruthy();
  expect(row['local-id']).toBeTruthy();
  expect(row.timestamp).toBeTruthy();
  expect(hasValidTimestamp(row.timestamp)).toBe(true);
}

function ensureNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ensureIfPresentString(value) {
  if (value == null || value === '') {
    return true;
  }
  return typeof value === 'string';
}

module.exports = {
  toFiniteNumber,
  isBoolish,
  hasValidTimestamp,
  ensureBasicDeviceRow,
  ensureLtpIdentityRow,
  ensureNonEmptyString,
  ensureIfPresentString
};
