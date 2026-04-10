describe('app.js', () => {
  it('loads without errors', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    require('../../src/app');
    expect(consoleSpy).toHaveBeenCalledWith('TaskFlow loaded');
    consoleSpy.mockRestore();
  });
});
