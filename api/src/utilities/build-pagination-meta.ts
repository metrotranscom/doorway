import { shouldPaginate } from './pagination-helpers';

export const buildPaginationInfo = (
  limit: number,
  page: number,
  count: number,
  returnedRecordCount: number,
) => {
  const isPaginated = shouldPaginate(limit, page);

  const itemsPerPage =
    isPaginated && limit !== -1 ? limit : returnedRecordCount;
  const totalItems = isPaginated ? count : returnedRecordCount;

  return {
    currentPage: isPaginated ? page : 1,
    itemCount: returnedRecordCount,
    itemsPerPage: itemsPerPage,
    totalItems: totalItems,
    totalPages: Math.ceil(
      totalItems / (itemsPerPage ? itemsPerPage : totalItems),
    ),
  };
};
