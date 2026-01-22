// ═══════════════════════════════════════════════════════════
// Category DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Basic category info (flat)
 */
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  isSystem?: boolean;
}

/**
 * Category with parent info
 */
export interface CategoryWithParentDTO extends CategoryDTO {
  parentId: string | null;
  parentName: string | null;
}

/**
 * Hierarchical category tree node
 */
export interface CategoryTreeNodeDTO extends CategoryDTO {
  depth: number;
  children: CategoryTreeNodeDTO[];
  articleCount?: number; // Optional: for admin view
}

/**
 * Category tree response
 */
export interface CategoryTreeResponse {
  tree: CategoryTreeNodeDTO[];
  flatList: CategoryDTO[]; // For easy lookup
}

// ═══════════════════════════════════════════════════════════
// Admin DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Admin category with stats
 */
export interface AdminCategoryDTO extends CategoryDTO {
  parentId: string | null;
  parentName: string | null;
  depth: number;
  descendantCount: number; // Number of subcategories
  revisionCount: number;   // Number of revisions in this category
  createdAt: string;
  updatedAt: string;
}

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  slug?: string; // Auto-generated if not provided
  parentId?: string | null;
}

/**
 * Update category input
 */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
}

/**
 * Reparent category input
 */
export interface ReparentCategoryInput {
  newParentId: string | null; // null = make root
}

/**
 * Create/update response
 */
export interface CategoryMutationResponse {
  category: AdminCategoryDTO;
  message: string;
}

/**
 * Delete response
 */
export interface DeleteCategoryResponse {
  deletedCategoryCount: number;
  reassignedRevisionCount: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════
// Filter DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Category filter option (for dropdowns)
 */
export interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
  depth: number;
  fullPath: string; // e.g., "Hadis > Hadis Usulü"
}

