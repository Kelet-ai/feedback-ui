/**
 * Build verification tests to ensure the library exports are correctly built and available
 */
import { describe, expect, test } from 'bun:test';

describe('Build verification', () => {
  test('all expected exports are available in the built package', async () => {
    // Import from the built dist files to verify they work
    const distIndexPath = new URL('../dist/index.d.ts', import.meta.url)
      .pathname;

    // Check that the TypeScript declaration file exists and has content
    const file = await Bun.file(distIndexPath);
    const content = await file.text();

    expect(content).toBeTruthy();
    expect(content.trim()).not.toBe('export {};');

    // Verify all expected exports are present in the declaration file
    const expectedExports = [
      'VoteFeedback',
      'KeletProvider',
      'KeletContext',
      'useKelet',
      'useDefaultFeedbackHandler',
      'useFeedbackState',
      'FeedbackData',
      'VoteFeedbackRootProps',
      'FeedbackStateOptions',
      'DiffType',
    ];

    expectedExports.forEach(expectedExport => {
      expect(content).toContain(expectedExport);
    });
  });

  test('built JavaScript files exist and are not empty', async () => {
    const esModulePath = new URL('../dist/feedback-ui.es.js', import.meta.url)
      .pathname;
    const umdModulePath = new URL('../dist/feedback-ui.umd.js', import.meta.url)
      .pathname;

    // Check ES module
    const esFile = await Bun.file(esModulePath);
    const esContent = await esFile.text();
    expect(esContent).toBeTruthy();
    expect(esContent.length).toBeGreaterThan(1000); // Should be a substantial file

    // Check UMD module
    const umdFile = await Bun.file(umdModulePath);
    const umdContent = await umdFile.text();
    expect(umdContent).toBeTruthy();
    expect(umdContent.length).toBeGreaterThan(1000); // Should be a substantial file
  });

  test('package.json exports configuration is correct', async () => {
    const packageJsonPath = new URL('../package.json', import.meta.url)
      .pathname;
    const packageJson = await Bun.file(packageJsonPath).json();

    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['.'].types).toBe('./dist/index.d.ts');
    expect(packageJson.exports['.'].import).toBe('./dist/feedback-ui.es.js');
    expect(packageJson.exports['.'].require).toBe('./dist/feedback-ui.umd.js');

    expect(packageJson.main).toBe('./dist/feedback-ui.umd.js');
    expect(packageJson.module).toBe('./dist/feedback-ui.es.js');
    expect(packageJson.types).toBe('./dist/index.d.ts');
  });
});
