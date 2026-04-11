export interface FunctionReq {
  body?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  method?: string;
}

export interface FunctionRes {
  json: (body: unknown, statusCode?: number) => unknown;
  send: (body: unknown, statusCode?: number, headers?: Record<string, string>) => unknown;
}

export interface FunctionContext {
  req: FunctionReq;
  res: FunctionRes;
  log: (message: string) => void;
  error: (message: string) => void;
}
