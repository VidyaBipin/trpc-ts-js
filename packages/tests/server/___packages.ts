import * as mock_trpcServer from '../../server/src';
jest.mock('@trpc/server', () => mock_trpcServer);
import * as mock_trpcServer__observable from '../../server/src/observable';
jest.mock('@trpc/server/observable', () => mock_trpcServer__observable);
import * as mock_trpcServer__shared from '../../server/src/shared';
jest.mock('@trpc/server/shared', () => mock_trpcServer__shared);


import * as mock_trpcServer__adapters__awsLambda from '../../server/src/adapters/aws-lambda';
jest.mock('@trpc/server/adapters/awsLambda', () => mock_trpcServer__adapters__awsLambda);
import * as mock_trpcServer__adapters__fastify from '../../server/src/adapters/fastify';
jest.mock('@trpc/server/adapters/fastify', () => mock_trpcServer__adapters__fastify);
import * as mock_trpcServer__adapters__fetch from '../../server/src/adapters/fetch';
jest.mock('@trpc/server/adapters/fetch', () => mock_trpcServer__adapters__fetch);
import * as mock_trpcServer__adapters__nodeHTTP from '../../server/src/adapters/node-http';
jest.mock('@trpc/server/adapters/nodeHTTP', () => mock_trpcServer__adapters__nodeHTTP);
import * as mock_trpcServer__adapters__express from '../../server/src/adapters/express';
jest.mock('@trpc/server/adapters/express', () => mock_trpcServer__adapters__express);
import * as mock_trpcServer__adapters__next from '../../server/src/adapters/next';
jest.mock('@trpc/server/adapters/next', () => mock_trpcServer__adapters__next);
import * as mock_trpcServer__adapters__standalone from '../../server/src/adapters/standalone';
jest.mock('@trpc/server/adapters/standalone', () => mock_trpcServer__adapters__standalone);
import * as mock_trpcServer__adapters__ws from '../../server/src/adapters/ws';
jest.mock('@trpc/server/adapters/ws', () => mock_trpcServer__adapters__ws);

import * as mock_trpcClient from '../../client/src';
jest.mock('@trpc/client', () => mock_trpcClient);

import * as mock_trpcReact from '../../react-query/src';
jest.mock('@trpc/react-query', () => mock_trpcReact);
import * as mock_trpcReact__ssg from '../../react-query/src/ssg';
jest.mock('@trpc/react-query/ssg', () => mock_trpcReact__ssg);
import * as mock_trpcReact__shared from '../../react-query/src/shared';
jest.mock('@trpc/react-query/shared', () => mock_trpcReact__shared);

import * as mock_trpcNext from '../../next/src';
jest.mock('@trpc/next', () => mock_trpcNext);

export { mock_trpcServer as trpcServer, mock_trpcClient as trpcClient, mock_trpcReact as trpcReact, mock_trpcReact__ssg as trpcReact__ssg };