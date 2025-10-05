import { Injectable } from "@nestjs/common";
@Injectable()
export class PaginationService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  /** Parse to number, return undefined for null/undefined/NaN, else absolute value */
  private normalize(value?: number): number | undefined {
    if (value === undefined || value === null) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : Math.abs(n);
  }
  /** Resolve page to a positive integer, defaulting to 1 */
  private resolvePage(page?: number): number {
    const p = this.normalize(page);
    return p && p > 0 ? Math.floor(p) : 1;
  }
  /** Resolve pageSize to a positive integer, defaulting to DEFAULT_PAGE_SIZE */
  private resolvePageSize(pageSize?: number): number {
    const ps = this.normalize(pageSize);
    return ps && ps > 0 ? Math.floor(ps) : PaginationService.DEFAULT_PAGE_SIZE;
  }
  /**
   * Get skip value for database queries.
   * Uses default page=1 when missing/invalid.
   */
  getSkip(page?: number, pageSize?: number): number {
    const p = this.resolvePage(page);
    const ps = this.resolvePageSize(pageSize);
    return Math.max((p - 1) * ps, 0);
  }
  /**
   * Get take value for database queries.
   * Defaults to 10 when missing/invalid.
   */
  getTake(pageSize?: number): number {
    return this.resolvePageSize(pageSize);
  }
  /**
   * Calculate total pages, always >= 1.
   * Uses default pageSize=10 when missing/invalid.
   */
  calculateTotalPages(totalCount: number, pageSize?: number): number {
    const ps = this.resolvePageSize(pageSize);
    return Math.max(Math.ceil(totalCount / ps), 1);
  }
  /**
   * Centralized pagination.
   * Always paginates with default {page=1, pageSize=10} when not provided.
   */
  paginate(page?: number, pageSize?: number, totalCount: number = 0) {
    const currentPage = this.resolvePage(page);
    const take = this.getTake(pageSize);
    const skip = this.getSkip(page, pageSize);
    const totalPages = this.calculateTotalPages(totalCount, take);
    return { skip, take, totalPages, currentPage };
  }
}