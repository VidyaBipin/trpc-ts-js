import { isPlainObject } from './isPlainObject';
import { TsonTypeHandler } from './types';

type UnknownMap = Map<unknown, unknown>;
export const MapHandler: TsonTypeHandler<UnknownMap> = {
  test(v) {
    return v instanceof Map;
  },
  encode(v) {
    return Array.from(v.entries());
  },
  decode(v) {
    return new Map(v as any[]);
  },
};

export const SetHandler: TsonTypeHandler<Set<unknown>> = {
  test(v) {
    return v instanceof Set;
  },
  encode(v) {
    return Array.from(v);
  },
  decode(v) {
    return new Set(v as any[]);
  },
};
export const bigintHandler: TsonTypeHandler<bigint> = {
  primitive: 'bigint',
  decode(v) {
    return BigInt(v as string);
  },
  encode(v) {
    return v.toString();
  },
};
export const numberHandler: TsonTypeHandler<number> = {
  primitive: 'number',
  transform: false,
  test(v) {
    if (isNaN(v as number)) {
      throw new Error('NaN is not supported');
    }
    return true;
  },
};

export const undefinedHandler: TsonTypeHandler<undefined> = {
  primitive: 'undefined',
  encode() {
    return 0;
  },
  decode() {
    return undefined;
  },
};

export const DateHandler: TsonTypeHandler<Date> = {
  encode(value) {
    return value.toJSON();
  },
  decode(value) {
    return new Date(value as string);
  },
  test(value) {
    return value instanceof Date;
  },
};

export class UnknownObjectGuardError extends Error {
  /**
   * The bad object that was found
   */
  public readonly value;

  constructor(value: unknown) {
    super(`Unknown object found`);

    this.name = this.constructor.name;
    this.value = value;
  }
}
/**
 * This is a guard that will throw an error if a non-plain object is found which isn't handled.
 * @remark Make sure to define this last in the record of guards.
 * @throws {UnknownObjectGuardError} If a non-plain object is found.
 */
export const unknownObjectGuard: TsonTypeHandler<unknown> = {
  decode: (v) => v,
  encode: (v) => v,
  test(v) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !isPlainObject(v)) {
      throw new UnknownObjectGuardError(v);
    }
    return false;
  },
};
