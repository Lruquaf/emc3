import type { CategoryTreeNodeDTO, CategoryFilterOption } from '@emc3/shared';

/**
 * Build flat list with full paths for filter dropdown
 */
export function buildCategoryFilterOptions(
  tree: CategoryTreeNodeDTO[],
  parentPath = ''
): CategoryFilterOption[] {
  const options: CategoryFilterOption[] = [];

  for (const node of tree) {
    const fullPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
    
    options.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      depth: node.depth,
      fullPath,
    });

    if (node.children.length > 0) {
      options.push(...buildCategoryFilterOptions(node.children, fullPath));
    }
  }

  return options;
}

/**
 * Find category by ID in tree
 */
export function findCategoryInTree(
  tree: CategoryTreeNodeDTO[],
  id: string
): CategoryTreeNodeDTO | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = findCategoryInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get ancestor path for a category
 */
export function getCategoryPath(
  tree: CategoryTreeNodeDTO[],
  id: string,
  path: CategoryTreeNodeDTO[] = []
): CategoryTreeNodeDTO[] | null {
  for (const node of tree) {
    if (node.id === id) {
      return [...path, node];
    }
    if (node.children.length > 0) {
      const found = getCategoryPath(node.children, id, [...path, node]);
      if (found) return found;
    }
  }
  return null;
}

