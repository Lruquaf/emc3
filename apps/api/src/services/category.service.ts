import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { slugify } from '../utils/slugify.js';
import {
  SYSTEM_CATEGORY_SLUG,
  CATEGORY_AUDIT_ACTIONS,
  MAX_CATEGORY_DEPTH,
} from '@emc3/shared';
import type {
  CategoryDTO,
  CategoryTreeNodeDTO,
  CategoryTreeResponse,
  CategoryWithParentDTO,
  AdminCategoryDTO,
  CategoryMutationResponse,
  DeleteCategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Category Service
// ═══════════════════════════════════════════════════════════

export class CategoryService {
  
  // ─────────────────────────────────────────────────────────
  // PUBLIC: Get Category Tree
  // ─────────────────────────────────────────────────────────

  async getCategoryTree(): Promise<CategoryTreeResponse> {
    // Get all categories with their parent info
    const categories = await prisma.category.findMany({
      include: {
        ancestors: {
          where: { depth: 1 }, // Only direct parent
          include: {
            ancestor: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get root-level depth for each category
    const depthMap = await this.getCategoryDepths();

    // Build flat list
    const flatList: CategoryDTO[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      isSystem: cat.isSystem,
    }));

    // Build tree structure
    const tree = this.buildTreeFromFlat(categories, depthMap);

    return { tree, flatList };
  }

  /**
   * Build hierarchical tree from flat category list
   */
  private buildTreeFromFlat(
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      isSystem: boolean;
      ancestors: Array<{
        ancestorId: string;
        ancestor: { id: string; name: string };
      }>;
    }>,
    depthMap: Map<string, number>
  ): CategoryTreeNodeDTO[] {
    // Create nodes map
    const nodesMap = new Map<string, CategoryTreeNodeDTO>();
    
    for (const cat of categories) {
      nodesMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isSystem: cat.isSystem,
        depth: depthMap.get(cat.id) || 0,
        children: [],
      });
    }

    // Build parent-child relationships
    const rootNodes: CategoryTreeNodeDTO[] = [];

    for (const cat of categories) {
      const node = nodesMap.get(cat.id)!;
      const parentClosure = cat.ancestors[0]; // depth=1 parent
      
      if (parentClosure) {
        const parentNode = nodesMap.get(parentClosure.ancestorId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    }

    // Sort children recursively
    const sortTree = (nodes: CategoryTreeNodeDTO[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      for (const node of nodes) {
        sortTree(node.children);
      }
    };
    
    sortTree(rootNodes);
    return rootNodes;
  }

  /**
   * Get depth for all categories
   */
  private async getCategoryDepths(): Promise<Map<string, number>> {
    const closures = await prisma.categoryClosure.findMany({
      where: { depth: { gt: 0 } },
    });

    const depthMap = new Map<string, number>();
    
    for (const closure of closures) {
      const currentDepth = depthMap.get(closure.descendantId) || 0;
      depthMap.set(closure.descendantId, Math.max(currentDepth, closure.depth));
    }

    return depthMap;
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Get Category by Slug
  // ─────────────────────────────────────────────────────────

  async getCategoryBySlug(slug: string): Promise<CategoryWithParentDTO> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        ancestors: {
          where: { depth: 1 },
          include: {
            ancestor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    const parentClosure = category.ancestors[0];

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      isSystem: category.isSystem,
      parentId: parentClosure?.ancestorId ?? null,
      parentName: parentClosure?.ancestor.name ?? null,
    };
  }

  // ─────────────────────────────────────────────────────────
  // PUBLIC: Get Category Descendants (for feed filtering)
  // ─────────────────────────────────────────────────────────

  async getCategoryDescendants(slug: string): Promise<{ categoryIds: string[] }> {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    // Get all descendants including self
    const closures = await prisma.categoryClosure.findMany({
      where: { ancestorId: category.id },
      select: { descendantId: true },
    });

    return {
      categoryIds: closures.map((c) => c.descendantId),
    };
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN: Get All Categories with Stats
  // ─────────────────────────────────────────────────────────

  async getAdminCategories(): Promise<AdminCategoryDTO[]> {
    const categories = await prisma.category.findMany({
      include: {
        ancestors: {
          where: { depth: 1 },
          include: {
            ancestor: { select: { id: true, name: true } },
          },
        },
        descendants: true, // All descendants for count
        revisions: { select: { revisionId: true } },
      },
      orderBy: { name: 'asc' },
    });

    const depthMap = await this.getCategoryDepths();

    return categories.map((cat) => {
      const parentClosure = cat.ancestors[0];
      // Descendants count (excluding self)
      const descendantCount = cat.descendants.filter((d) => d.depth > 0).length;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        isSystem: cat.isSystem,
        parentId: parentClosure?.ancestorId ?? null,
        parentName: parentClosure?.ancestor.name ?? null,
        depth: depthMap.get(cat.id) || 0,
        descendantCount,
        revisionCount: cat.revisions.length,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      };
    });
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN: Create Category
  // ─────────────────────────────────────────────────────────

  async createCategory(
    input: CreateCategoryInput,
    adminId: string
  ): Promise<CategoryMutationResponse> {
    const { name, slug: inputSlug, parentId } = input;

    // Generate or validate slug
    const slug = inputSlug || slugify(name);

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw AppError.conflict('Bu slug zaten kullanılıyor');
    }

    // Validate parent if provided
    let parentDepth = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw AppError.notFound('Parent kategori bulunamadı');
      }
      const depthMap = await this.getCategoryDepths();
      parentDepth = depthMap.get(parentId) || 0;
      
      // Check max depth
      if (parentDepth >= MAX_CATEGORY_DEPTH - 1) {
        throw AppError.badRequest(`Maksimum kategori derinliği ${MAX_CATEGORY_DEPTH}`);
      }
    }

    // Transaction: create category + closure entries
    const category = await prisma.$transaction(async (tx) => {
      // 1. Create category
      const newCategory = await tx.category.create({
        data: { name, slug },
      });

      // 2. Create self-reference closure (depth 0)
      await tx.categoryClosure.create({
        data: {
          ancestorId: newCategory.id,
          descendantId: newCategory.id,
          depth: 0,
        },
      });

      // 3. If has parent, copy parent's ancestors with incremented depth
      if (parentId) {
        const parentClosures = await tx.categoryClosure.findMany({
          where: { descendantId: parentId },
        });

        for (const pc of parentClosures) {
          await tx.categoryClosure.create({
            data: {
              ancestorId: pc.ancestorId,
              descendantId: newCategory.id,
              depth: pc.depth + 1,
            },
          });
        }
      }

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: CATEGORY_AUDIT_ACTIONS.CATEGORY_CREATED,
          targetType: 'category',
          targetId: newCategory.id,
          meta: {
            name,
            slug,
            parentId,
          },
        },
      });

      return newCategory;
    });

    // Fetch full category data
    const adminCategory = await this.getAdminCategoryById(category.id);

    return {
      category: adminCategory,
      message: 'Kategori başarıyla oluşturuldu',
    };
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN: Update Category
  // ─────────────────────────────────────────────────────────

  async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    adminId: string
  ): Promise<CategoryMutationResponse> {
    const { name, slug } = input;

    // Check category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    // Check if system category
    if (category.isSystem && slug && slug !== category.slug) {
      throw AppError.forbidden('Sistem kategorisinin slug\'ı değiştirilemez');
    }

    // Check slug uniqueness if changing
    if (slug && slug !== category.slug) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        throw AppError.conflict('Bu slug zaten kullanılıyor');
      }
    }

    // Update category
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: CATEGORY_AUDIT_ACTIONS.CATEGORY_UPDATED,
          targetType: 'category',
          targetId: id,
          meta: {
            changes: { name, slug },
            previousValues: {
              name: category.name,
              slug: category.slug,
            },
          },
        },
      });
    });

    const adminCategory = await this.getAdminCategoryById(id);

    return {
      category: adminCategory,
      message: 'Kategori başarıyla güncellendi',
    };
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN: Reparent Category
  // ─────────────────────────────────────────────────────────

  async reparentCategory(
    id: string,
    newParentId: string | null,
    adminId: string
  ): Promise<CategoryMutationResponse> {
    // Check category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    // Check if system category
    if (category.isSystem) {
      throw AppError.forbidden('Sistem kategorisi taşınamaz');
    }

    // Validate new parent if provided
    if (newParentId) {
      const newParent = await prisma.category.findUnique({
        where: { id: newParentId },
      });
      if (!newParent) {
        throw AppError.notFound('Hedef parent kategori bulunamadı');
      }

      // Check if new parent is a descendant of current category (would create cycle)
      const descendants = await prisma.categoryClosure.findMany({
        where: { ancestorId: id },
        select: { descendantId: true },
      });
      const descendantIds = new Set(descendants.map((d) => d.descendantId));
      
      if (descendantIds.has(newParentId)) {
        throw AppError.badRequest('Kategori kendi alt kategorisinin altına taşınamaz');
      }

      // Check max depth
      const depthMap = await this.getCategoryDepths();
      const newParentDepth = depthMap.get(newParentId) || 0;
      const subtreeMaxDepth = this.getSubtreeMaxDepth(id, depthMap, descendantIds);
      
      if (newParentDepth + 1 + subtreeMaxDepth > MAX_CATEGORY_DEPTH) {
        throw AppError.badRequest(`Bu taşıma işlemi maksimum derinliği (${MAX_CATEGORY_DEPTH}) aşar`);
      }
    }

    // Get current parent for audit log
    const currentParent = await prisma.categoryClosure.findFirst({
      where: { descendantId: id, depth: 1 },
      select: { ancestorId: true },
    });

    // Transaction: update closure table
    await prisma.$transaction(async (tx) => {
      // 1. Get all descendants of this category
      const subtree = await tx.categoryClosure.findMany({
        where: { ancestorId: id },
        select: { descendantId: true, depth: true },
      });
      const subtreeIds = subtree.map((s) => s.descendantId);

      // 2. Delete old ancestor links (excluding self-references within subtree)
      await tx.categoryClosure.deleteMany({
        where: {
          descendantId: { in: subtreeIds },
          ancestorId: { notIn: subtreeIds },
        },
      });

      // 3. If new parent, add new ancestor links
      if (newParentId) {
        const newParentClosures = await tx.categoryClosure.findMany({
          where: { descendantId: newParentId },
        });

        for (const sub of subtree) {
          for (const npc of newParentClosures) {
            await tx.categoryClosure.create({
              data: {
                ancestorId: npc.ancestorId,
                descendantId: sub.descendantId,
                depth: npc.depth + sub.depth + 1,
              },
            });
          }
        }
      }

      // 4. Audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: CATEGORY_AUDIT_ACTIONS.CATEGORY_REPARENTED,
          targetType: 'category',
          targetId: id,
          meta: {
            previousParentId: currentParent?.ancestorId ?? null,
            newParentId,
          },
        },
      });
    });

    const adminCategory = await this.getAdminCategoryById(id);

    return {
      category: adminCategory,
      message: 'Kategori başarıyla taşındı',
    };
  }

  private getSubtreeMaxDepth(
    rootId: string,
    depthMap: Map<string, number>,
    descendantIds: Set<string>
  ): number {
    const rootDepth = depthMap.get(rootId) || 0;
    let maxRelativeDepth = 0;

    for (const descId of descendantIds) {
      const descDepth = depthMap.get(descId) || 0;
      const relativeDepth = descDepth - rootDepth;
      maxRelativeDepth = Math.max(maxRelativeDepth, relativeDepth);
    }

    return maxRelativeDepth;
  }

  // ─────────────────────────────────────────────────────────
  // ADMIN: Delete Category (and Subtree)
  // ─────────────────────────────────────────────────────────

  async deleteCategory(
    id: string,
    adminId: string
  ): Promise<DeleteCategoryResponse> {
    // Check category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    // Check if system category
    if (category.isSystem) {
      throw AppError.forbidden('Sistem kategorisi silinemez');
    }

    // Get system category for reassignment
    const systemCategory = await prisma.category.findUnique({
      where: { slug: SYSTEM_CATEGORY_SLUG },
    });
    if (!systemCategory) {
      throw AppError.internal('Sistem kategorisi bulunamadı');
    }

    // Get all category IDs in subtree
    const subtreeClosures = await prisma.categoryClosure.findMany({
      where: { ancestorId: id },
      select: { descendantId: true },
    });
    const subtreeCategoryIds = [...new Set(subtreeClosures.map((c) => c.descendantId))];
    const deletedCategoryCount = subtreeCategoryIds.length;

    // Transaction: delete and reassign
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get revisions that will lose categories
      const affectedRevisionCategories = await tx.revisionCategory.findMany({
        where: { categoryId: { in: subtreeCategoryIds } },
        select: { revisionId: true },
      });
      const affectedRevisionIds = [...new Set(affectedRevisionCategories.map((rc) => rc.revisionId))];

      // 2. Delete revision_categories links for subtree
      await tx.revisionCategory.deleteMany({
        where: { categoryId: { in: subtreeCategoryIds } },
      });

      // 3. Find revisions that now have zero categories
      let reassignedRevisionCount = 0;
      
      for (const revisionId of affectedRevisionIds) {
        const remainingCategories = await tx.revisionCategory.count({
          where: { revisionId },
        });

        if (remainingCategories === 0) {
          // Assign system category
          await tx.revisionCategory.create({
            data: {
              revisionId,
              categoryId: systemCategory.id,
            },
          });
          reassignedRevisionCount++;
        }
      }

      // 4. Delete closure entries for subtree
      await tx.categoryClosure.deleteMany({
        where: {
          OR: [
            { ancestorId: { in: subtreeCategoryIds } },
            { descendantId: { in: subtreeCategoryIds } },
          ],
        },
      });

      // 5. Hard delete subtree categories
      await tx.category.deleteMany({
        where: { id: { in: subtreeCategoryIds } },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: CATEGORY_AUDIT_ACTIONS.CATEGORY_DELETED_SUBTREE,
          targetType: 'category',
          targetId: id,
          meta: {
            deletedCategoryCount,
            reassignedRevisionCount,
            categoryName: category.name,
            categorySlug: category.slug,
          },
        },
      });

      return { reassignedRevisionCount };
    });

    return {
      deletedCategoryCount,
      reassignedRevisionCount: result.reassignedRevisionCount,
      message: `${deletedCategoryCount} kategori silindi, ${result.reassignedRevisionCount} revision "Diğer/Genel" kategorisine atandı`,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Helper: Get Admin Category by ID
  // ─────────────────────────────────────────────────────────

  private async getAdminCategoryById(id: string): Promise<AdminCategoryDTO> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        ancestors: {
          where: { depth: 1 },
          include: {
            ancestor: { select: { id: true, name: true } },
          },
        },
        descendants: true,
        revisions: { select: { revisionId: true } },
      },
    });

    if (!category) {
      throw AppError.notFound('Kategori bulunamadı');
    }

    const depthMap = await this.getCategoryDepths();
    const parentClosure = category.ancestors[0];
    const descendantCount = category.descendants.filter((d) => d.depth > 0).length;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      isSystem: category.isSystem,
      parentId: parentClosure?.ancestorId ?? null,
      parentName: parentClosure?.ancestor.name ?? null,
      depth: depthMap.get(category.id) || 0,
      descendantCount,
      revisionCount: category.revisions.length,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

