export class CategoryNotFoundError extends Error {
  constructor() {
    super("Category not found");
    this.name = "CategoryNotFoundError";
  }
}

export class DuplicateCategorySlugError extends Error {
  constructor() {
    super("Category with this slug already exists");
    this.name = "DuplicateCategorySlugError";
  }
}
