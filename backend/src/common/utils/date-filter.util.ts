import { SelectQueryBuilder } from 'typeorm';

export const applyDateFilter = (
  query: SelectQueryBuilder<any>,
  field: string,
  startDate?: string,
  endDate?: string,
) => {
  if (startDate) {
    query.andWhere(`${field} >= :startDate`, { startDate });
  }

  if (endDate) {
    if (endDate.length > 10) {
      // Full timestamp provided
      query.andWhere(`${field} <= :endDate`, { endDate });
    } else {
      // Date only provided, add 1 day for inclusive range
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query.andWhere(`${field} < :endDate`, {
        endDate: end.toISOString().split('T')[0],
      });
    }
  }
};
