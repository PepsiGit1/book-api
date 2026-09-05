import type { Request } from "express";

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
    take: number;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface PaginationOptions {
    defaultLimit?: number;
    maxLimit?: number;
}

export const getPagination = (
    req: Request,
    options: PaginationOptions = {},
): PaginationParams => {
    const { defaultLimit = 20, maxLimit = 100 } = options;

    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page =
        Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const limit =
        Number.isFinite(rawLimit) && rawLimit > 0
            ? Math.min(Math.floor(rawLimit), maxLimit)
            : defaultLimit;

    const skip = (page - 1) * limit;

    return { page, limit, skip, take: limit };
};

export const buildPaginationMeta = (
    total: number,
    page: number,
    limit: number,
): PaginationMeta => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

export const paginate = async <T>(
    delegate: {
        findMany: (args: any) => Promise<T[]>;
        count: (args: any) => Promise<number>;
    },
    req: Request,
    queryArgs: Record<string, any> = {},
    options: PaginationOptions = {},
): Promise<{ data: T[]; meta: PaginationMeta }> => {
    const { skip, take, page, limit } = getPagination(req, options);
    const { where } = queryArgs;

    const [data, total] = await Promise.all([
        delegate.findMany({ ...queryArgs, skip, take }),
        delegate.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
};