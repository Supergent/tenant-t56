// Auto-generated type stubs for development
// These will be replaced by 'npx convex dev'

export type QueryCtx = {
  db: {
    query: (table: string) => QueryBuilder;
    get: (id: any) => Promise<any>;
    insert: (table: string, value: any) => Promise<any>;
    patch: (id: any, value: any) => Promise<void>;
    replace: (id: any, value: any) => Promise<void>;
    delete: (id: any) => Promise<void>;
  };
  auth: {
    getUserIdentity: () => Promise<any>;
  };
};

export type MutationCtx = QueryCtx & {
  scheduler: {
    runAfter: (delay: number, fn: any, ...args: any[]) => Promise<any>;
    runAt: (timestamp: number, fn: any, ...args: any[]) => Promise<any>;
  };
};

export type ActionCtx = {
  runQuery: (query: any, ...args: any[]) => Promise<any>;
  runMutation: (mutation: any, ...args: any[]) => Promise<any>;
  scheduler: MutationCtx["scheduler"];
  auth: QueryCtx["auth"];
};

export type HttpActionCtx = {
  runQuery: ActionCtx["runQuery"];
  runMutation: ActionCtx["runMutation"];
  runAction: (action: any, ...args: any[]) => Promise<any>;
};

export type QueryBuilder = {
  filter: (predicate: any) => QueryBuilder;
  order: (order: "asc" | "desc") => QueryBuilder;
  collect: () => Promise<any[]>;
  take: (n: number) => Promise<any[]>;
  first: () => Promise<any | null>;
  unique: () => Promise<any | null>;
  paginate: (opts: any) => Promise<any>;
  withIndex: (index: string, query?: any) => QueryBuilder;
};

export const query = (handler: any): any => handler;
export const mutation = (handler: any): any => handler;
export const action = (handler: any): any => handler;
export const internalQuery = (handler: any): any => handler;
export const internalMutation = (handler: any): any => handler;
export const internalAction = (handler: any): any => handler;
export const httpAction = (handler: any): any => handler;

export type Id<TableName extends string> = string & { __tableName: TableName };
export type Doc<TableName extends string> = any;
