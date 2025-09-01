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
    const files = [
      '../dist/feedback-ui.es.js',
      '../dist/feedback-ui.es.min.js',
      '../dist/feedback-ui.umd.js',
      '../dist/feedback-ui.umd.min.js',
    ];

    for (const filePath of files) {
      const fullPath = new URL(filePath, import.meta.url).pathname;
      const file = await Bun.file(fullPath);
      const content = await file.text();

      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(1000); // Should be a substantial file

      // Check that source maps exist
      const mapPath = fullPath + '.map';
      const mapFile = await Bun.file(mapPath);
      const mapExists = await mapFile.exists();
      expect(mapExists).toBe(true);

      // Verify source maps include source content for OSS debugging
      const mapContent = await mapFile.json();
      expect(mapContent.sourcesContent).toBeDefined();
      expect(mapContent.sourcesContent.length).toBeGreaterThan(0);
    }
  });

  test('package.json exports configuration is correct', async () => {
    const packageJsonPath = new URL('../package.json', import.meta.url)
      .pathname;
    const packageJson = await Bun.file(packageJsonPath).json();

    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['.'].types).toBe('./dist/index.d.ts');

    // Check dual exports structure
    expect(packageJson.exports['.'].development).toBeDefined();
    expect(packageJson.exports['.'].development.import).toBe(
      './dist/feedback-ui.es.js'
    );
    expect(packageJson.exports['.'].development.require).toBe(
      './dist/feedback-ui.umd.js'
    );

    expect(packageJson.exports['.'].production).toBeDefined();
    expect(packageJson.exports['.'].production.import).toBe(
      './dist/feedback-ui.es.min.js'
    );
    expect(packageJson.exports['.'].production.require).toBe(
      './dist/feedback-ui.umd.min.js'
    );

    // Check fallback exports (minified by default)
    expect(packageJson.exports['.'].import).toBe(
      './dist/feedback-ui.es.min.js'
    );
    expect(packageJson.exports['.'].require).toBe(
      './dist/feedback-ui.umd.min.js'
    );

    expect(packageJson.main).toBe('./dist/feedback-ui.umd.js');
    expect(packageJson.module).toBe('./dist/feedback-ui.es.js');
    expect(packageJson.types).toBe('./dist/index.d.ts');
  });
});
