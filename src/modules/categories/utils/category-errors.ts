export class CategoryNotFoundError extends Error {
  constructor() {
    super("Category not found");
    this.name = "CategoryNotFoundError";
  }
}

export class DuplicateCategoryNameError extends Error {
  constructor() {
    super("Category with this name already exists");
    this.name = "DuplicateCategoryNameError";
  }
}

export class InvalidParentCategoryError extends Error {
  constructor() {
    super("Invalid parent category");
    this.name = "InvalidParentCategoryError";
  }
}
