import { Page } from "../repository/types";
import { Pagination } from "../validations/schemas";

export interface Paginated<T> {
  items: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export const toPage = ({ page, limit }: Pagination): Page => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const paginate = <T>(
  [items, total]: [T[], number],
  { page, limit }: Pagination,
): Paginated<T> => ({
  items,
  pagination: { total, page, limit, pages: Math.ceil(total / limit) },
});

export const average = (values: number[]): number | null =>
  values.length ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100 : null;
