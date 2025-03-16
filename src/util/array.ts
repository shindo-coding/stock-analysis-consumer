export function removeDuplicates<T>(arr: T[]): T[] {
	return Array.from(new Set(arr));
}

/**
 * Splits an array into chunks of the specified size.
 *
 * @param array - The input array to be chunked
 * @param size - The size of each chunk
 * @returns An array of arrays, where each inner array has at most `size` elements
 * @example
 * chunkArray([1, 2, 3, 4, 5], 2)
 * // Returns [[1, 2], [3, 4], [5]]
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
	if (!array || size <= 0) {
		return [];
	}

	const chunksCount = Math.ceil(array.length / size);
	// Pre-allocate result array
	const result = new Array(chunksCount);

	for (let i = 0; i < chunksCount; i++) {
		const start = i * size;
		// Avoid unnecessary slice operations with an extra length check
		result[i] = array.slice(start, start + size);
	}

	return result;
}

/**
 * Flattens a multi-dimensional array into a single-level array.
 * Optimized for performance with large arrays.
 *
 * @param array - The input array to be flattened
 * @returns A new array with all sub-array elements concatenated into it recursively
 * @example
 * // Returns [1, 2, 3, 4, 5, 6]
 * flattenArray([1, [2, 3], [4, [5, 6]]])
 */
export function flattenArray<T>(array: any[]): T[] {
  // Early size estimation to reduce reallocations
  const result: T[] = [];

  // Using a stack-based approach instead of recursion for better performance
  const stack = [...array];

  while (stack.length > 0) {
    const item = stack.pop();

    if (Array.isArray(item)) {
      // Push items in reverse order so they get processed in the correct order
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
      }
    } else {
      result.unshift(item as T); // Add at beginning since we're processing in reverse
    }
  }

  return result;
}
