import { DefaultErrorShape } from '../error/formatter';
import { CombinedDataTransformer } from '../transformer';
import { RootConfig } from './internals/config';
import {
  AnyProcedureBuilderDef,
  ProcedureCallOptions,
} from './internals/procedureBuilder';
import { UnsetMarker } from './internals/utils';
import { ProcedureType } from './types';

type ClientContext = Record<string, unknown>;

/**
 * @internal
 */
export interface ProcedureOptions {
  /**
   * Client-side context
   */
  context?: ClientContext;
  signal?: AbortSignal;
}

/**
 * FIXME: this should only take 1 generic argument instead of a list
 * @internal
 */
export interface ProcedureParams<
  TConfig extends RootConfig = {
    transformer: CombinedDataTransformer;
    errorShape: DefaultErrorShape;
    ctx: Record<string, unknown>;
    meta: Record<string, unknown>;
  },
  TContextIn = unknown,
  TContextOut = unknown,
  TInputIn = unknown,
  TInputOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
  TMeta = unknown,
> {
  // FIXME make non-optional
  _config: TConfig;
  /**
   * @internal
   */
  _meta: TMeta;
  /**
   * @internal
   */
  _ctx_in: TContextIn;
  /**
   * @internal
   */
  _ctx_out: TContextOut;
  /**
   * @internal
   */
  _input_in: TInputIn;
  /**
   * @internal
   */
  _input_out: TInputOut;
  /**
   * @internal
   */
  _output_in: TOutputIn;
  /**
   * @internal
   */
  _output_out: TOutputOut;
}

/**
 * @internal
 */
export type ProcedureArgs<TParams extends ProcedureParams> =
  TParams['_input_in'] extends UnsetMarker
    ? [input?: undefined | void, opts?: ProcedureOptions]
    : undefined extends TParams['_input_in']
    ? [input?: TParams['_input_in'] | void, opts?: ProcedureOptions]
    : [input: TParams['_input_in'], opts?: ProcedureOptions];

/**
 *
 * @internal
 */
export interface Procedure<
  TType extends ProcedureType,
  TParams extends ProcedureParams,
> {
  _type: TType;
  _def: TParams & AnyProcedureBuilderDef;
  /**
   * @deprecated use `._def.meta` instead
   */
  meta?: TParams['_meta'];
  _procedure: true;
  /**
   * @internal
   */
  (opts: ProcedureCallOptions): Promise<unknown>;
}

export type AnyQueryProcedure = Procedure<'query', any>;
export type AnyMutationProcedure = Procedure<'mutation', any>;
export type AnySubscriptionProcedure = Procedure<'subscription', any>;
export type AnyProcedure = Procedure<ProcedureType, any>;
