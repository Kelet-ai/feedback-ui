import { diff } from 'deep-diff';
import levenshtein from 'fast-levenshtein';
import { createTwoFilesPatch } from 'diff';

export type DiffType = 'git' | 'object' | 'json';

/**
 * Format the diff between two values based on the specified format
 */
export function formatDiff<T>(
  oldValue: T,
  newValue: T,
  diffType: DiffType = 'git',
  context = 3
): string {
  switch (diffType) {
    case 'git':
      return formatGitDiff(oldValue, newValue, context);
    case 'object':
      return formatObjectDiff(oldValue, newValue);
    case 'json':
      return formatJsonDiff(oldValue, newValue);
    default:
      return formatGitDiff(oldValue, newValue, context);
  }
}

/**
 * Format the diff between two values as a git-like diff with unified format
 * @param oldValue The old value
 * @param newValue The new value
 * @param context The number of lines of unchanged context to include (default: 3)
 * @returns A string containing the git-like diff in unified format
 */
function formatGitDiff<T>(oldValue: T, newValue: T, context = 3): string {
  // Pretty-print both objects as JSON
  const oldStr = stringify(oldValue);
  const newStr = stringify(newValue);

  // Generate unified patch with empty filenames
  const patch = createTwoFilesPatch(
    /* oldFilename */ '',
    /* newFilename */ '',
    oldStr,
    newStr,
    /* oldHeader   */ '',
    /* newHeader   */ '',
    { context }
  );

  // Strip out the first two lines ("--- " and "+++ ")
  return patch.split('\n').slice(2).join('\n');
}

/**
 * Format the diff between two values as an object diff
 */
function formatObjectDiff<T>(oldValue: T, newValue: T): string {
  const differences = diff(oldValue, newValue) || [];
  return JSON.stringify(differences, null, 2);
}

/**
 * Format the diff between two values as a JSON diff
 */
function formatJsonDiff<T>(oldValue: T, newValue: T): string {
  return JSON.stringify(
    {
      before: oldValue,
      after: newValue,
    },
    null,
    2
  );
}

/**
 * Calculate the difference percentage between two values
 */
export function calculateDiffPercentage<T>(oldValue: T, newValue: T): number {
  if (typeof oldValue === 'string' && typeof newValue === 'string') {
    return calculateStringDiffPercentage(oldValue, newValue);
  } else if (typeof oldValue === 'number' && typeof newValue === 'number') {
    return calculateNumberDiffPercentage(oldValue, newValue);
  } else {
    return calculateObjectDiffPercentage(oldValue, newValue);
  }
}

/**
 * Calculate the difference percentage between two strings using Levenshtein distance
 */
function calculateStringDiffPercentage(oldStr: string, newStr: string): number {
  if (oldStr === newStr) return 0;
  if (oldStr.length === 0) return 1;
  if (newStr.length === 0) return 1;

  const distance = levenshtein.get(oldStr, newStr);
  const maxLength = Math.max(oldStr.length, newStr.length);

  return distance / maxLength;
}

/**
 * Calculate the difference percentage between two numbers
 */
function calculateNumberDiffPercentage(oldNum: number, newNum: number): number {
  if (oldNum === newNum) return 0;
  if (oldNum === 0) return 1; // To avoid division by zero

  const change = Math.abs(newNum - oldNum);
  const base = Math.max(Math.abs(oldNum), Math.abs(newNum));

  // Normalize to ensure we don't exceed 1.0
  return Math.min(change / base, 1);
}

/**
 * Calculate the difference percentage between two objects
 */
function calculateObjectDiffPercentage<T>(oldObj: T, newObj: T): number {
  // If they're the same reference or deeply equal, no difference
  if (oldObj === newObj) return 0;

  // Get differences using deep-diff
  const differences = diff(oldObj, newObj) || [];
  if (differences.length === 0) return 0;

  // Count total properties and changed properties for a more accurate percentage
  const oldProps = countObjectProperties(oldObj);
  const newProps = countObjectProperties(newObj);
  const totalProps = Math.max(oldProps, newProps);

  if (totalProps === 0) return 0;

  // For each difference, calculate its weight
  let changeWeight = 0;
  for (const difference of differences) {
    switch (difference.kind) {
      case 'N': // New property
        changeWeight += 1;
        break;
      case 'D': // Deleted property
        changeWeight += 1;
        break;
      case 'E': // Edit property
        if (
          typeof difference.lhs === 'string' &&
          typeof difference.rhs === 'string'
        ) {
          // For string changes, use Levenshtein distance ratio
          const stringChangeRatio = calculateStringDiffPercentage(
            difference.lhs,
            difference.rhs
          );
          changeWeight += stringChangeRatio;
        } else if (
          typeof difference.lhs === 'number' &&
          typeof difference.rhs === 'number'
        ) {
          // For number changes, use number diff ratio
          const numberChangeRatio = calculateNumberDiffPercentage(
            difference.lhs,
            difference.rhs
          );
          changeWeight += numberChangeRatio;
        } else {
          // For other types, consider it a full change
          changeWeight += 1;
        }
        break;
      case 'A': // Array change
        changeWeight += 0.5; // Array changes are weighted less than full property changes
        break;
    }
  }

  // Return the ratio of changed properties to total properties
  return Math.min(changeWeight / totalProps, 1);
}

/**
 * Count the number of properties in an object recursively
 */
function countObjectProperties(obj: any): number {
  if (obj === null || obj === undefined) return 0;
  if (typeof obj !== 'object') return 1;
  if (Array.isArray(obj)) return obj.length;

  let count = 0;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      count += 1;
    }
  }
  return count;
}

/**
 * Safely convert a value to a string representation
 */
function stringify(value: any): string {
  try {
    return JSON.stringify(
      value,
      (_key, val) => {
        // Handle circular references and special values
        if (typeof val === 'function') return '[Function]';
        if (val === undefined) return '[undefined]';
        if (val === Infinity) return '[Infinity]';
        if (Number.isNaN(val)) return '[NaN]';
        return val;
      },
      2
    );
  } catch (_) {
    return String(value);
  }
}
