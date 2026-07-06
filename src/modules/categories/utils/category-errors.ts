import { AppError } from "../../../shared/errors/index.js";

export class CategoryNotFoundError extends AppError {
  constructor() {
    super("Category not found", 404, "CATEGORY_NOT_FOUND");
  }
}

export class DuplicateCategorySlugError extends AppError {
  constructor() {
    super("Category with this slug already exists", 409, "DUPLICATE_CATEGORY_SLUG");
  }
}
