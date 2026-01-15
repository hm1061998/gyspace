export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
  hasMore?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> => {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
      hasMore: (page - 1) * limit + limit < total,
    },
  };
};
