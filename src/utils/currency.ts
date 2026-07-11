import { Prisma } from '@prisma/client';

export type MoneyInput = Prisma.Decimal | number | string;

export function money(v: MoneyInput): Prisma.Decimal {
  return new Prisma.Decimal(v).toDecimalPlaces(2);
}

export function add(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return money(a).plus(money(b));
}

export function sub(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return money(a).minus(money(b));
}

export function isPositive(v: MoneyInput): boolean {
  return money(v).greaterThan(0);
}

export function gte(a: MoneyInput, b: MoneyInput): boolean {
  return money(a).greaterThanOrEqualTo(money(b));
}
