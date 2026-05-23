import type { PageData } from './types';

/** Legacy Spring `Result` envelope still returned by some endpoints. */
type NestedResult<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type SpringPage<T> = {
  content?: T[];
  pageNumber?: number;
  pageSize?: number;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
};

/** Map `PageAbleResponse` / nested `Result` payloads to UI `PageData`. */
export function normalizePage<T>(raw: unknown): PageData<T> {
  let page = raw as SpringPage<T>;
  const nested = raw as NestedResult<SpringPage<T>>;
  if (nested?.data && Array.isArray(nested.data.content)) {
    page = nested.data;
  }
  const content = page?.content ?? [];
  const pageIndex = page?.page ?? page?.pageNumber ?? 0;
  const uiPage = pageIndex >= 1 ? pageIndex : pageIndex + 1;
  return {
    content,
    page: uiPage,
    size: page?.size ?? page?.pageSize ?? content.length,
    totalElements: page?.totalElements ?? content.length,
    totalPages: page?.totalPages ?? 1,
    first: page?.first ?? pageIndex === 0,
    last: page?.last ?? true,
  };
}
