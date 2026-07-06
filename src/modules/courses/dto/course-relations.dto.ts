export interface CourseRelationItemDto {
  id: string;
  name: string;
  slug?: string;
}

export interface CourseInstructorDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isPrimary: boolean;
}

export interface ReplaceCourseCategoriesDto {
  categoryIds: string[];
}

export interface ReplaceCourseTagsDto {
  tagIds: string[];
}

export interface ReplaceCourseInstructorsDto {
  instructors: {
    userId: string;
    isPrimary?: boolean;
  }[];
}
