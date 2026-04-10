const { LocalStorageMock } = require('../mocks/localStorage');

describe('LocalStorageMock', () => {
  let storage;

  beforeEach(() => {
    storage = new LocalStorageMock();
  });

  it('stores and retrieves values', () => {
    storage.setItem('key', 'value');
    expect(storage.getItem('key')).toBe('value');
  });

  it('returns null for missing keys', () => {
    expect(storage.getItem('nonexistent')).toBeNull();
  });

  it('removes items', () => {
    storage.setItem('key', 'value');
    storage.removeItem('key');
    expect(storage.getItem('key')).toBeNull();
  });

  it('clears all items', () => {
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    storage.clear();
    expect(storage.length).toBe(0);
  });

  it('tracks length correctly', () => {
    expect(storage.length).toBe(0);
    storage.setItem('a', '1');
    expect(storage.length).toBe(1);
    storage.setItem('b', '2');
    expect(storage.length).toBe(2);
  });

  it('converts values to strings', () => {
    storage.setItem('num', 42);
    expect(storage.getItem('num')).toBe('42');
  });

  it('returns key by index', () => {
    storage.setItem('first', '1');
    expect(storage.key(0)).toBe('first');
    expect(storage.key(99)).toBeNull();
  });
});
