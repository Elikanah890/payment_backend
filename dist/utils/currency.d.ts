import { Prisma } from '@prisma/client';
export type MoneyInput = Prisma.Decimal | number | string;
export declare function money(v: MoneyInput): Prisma.Decimal;
export declare function add(a: MoneyInput, b: MoneyInput): Prisma.Decimal;
export declare function sub(a: MoneyInput, b: MoneyInput): Prisma.Decimal;
export declare function isPositive(v: MoneyInput): boolean;
export declare function gte(a: MoneyInput, b: MoneyInput): boolean;
//# sourceMappingURL=currency.d.ts.map