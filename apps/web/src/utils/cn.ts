type ClassValue = string | boolean | undefined | null | ClassValue[];

/**
 * Utility function to merge CSS classes
 * Simple implementation without tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ');
}

