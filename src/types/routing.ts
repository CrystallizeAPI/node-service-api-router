import Koa from 'koa';
export const httpMethods = ['get', 'post', 'put', 'patch', 'delete'] as const;
export type HttpMethod = typeof httpMethods[number];

export interface ValidatingRoute<T> {
    schema?: any;
    handler: (payload: any, args: any) => Promise<T>;
    args: (context: any) => any;
    authenticated?: boolean;
}

export interface StandardRoute {
    handler: (context: Koa.Context) => Promise<void>;
    authenticated?: boolean;
}

export interface ValidatingRequestRouting<T extends object = {}> {
    [path: string]: {
        [method in HttpMethod]?: ValidatingRoute<T>;
    };
}

export interface StandardRouting {
    [path: string]: {
        [method in HttpMethod]?: StandardRoute;
    };
}
