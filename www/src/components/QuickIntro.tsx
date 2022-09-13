import React, { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import First from '../../docs/landing-intro/First.md';
import Second from '../../docs/landing-intro/Second.md';
import Third from '../../docs/landing-intro/Third.md';
import '../css/custom.css';
import { SectionTitle } from './SectionTitle';

type StepProps = {
  num: number;
  title: ReactNode;
  description: ReactNode;
  code: ReactNode;
  rightSide?: boolean;
};

const Step: FC<StepProps> = ({ num, title, description, code, rightSide }) => {
  return (
    <div className="flex flex-col justify-between gap-12 lg:flex-row">
      <div
        className={twMerge(
          'flex-1 order-1 lg:order-[0]',
          rightSide && 'lg:order-1',
        )}
      >
        {code}
      </div>
      <div className="flex-1">
        <div className="flex flex-col justify-center gap-3 lg:flex-row lg:items-center lg:justify-start">
          <div className="grid w-6 h-6 rounded-full dark:bg-zinc-200 bg-[#313131] place-items-center">
            <p className="font-bold dark:text-[#313131] text-white">{num}</p>
          </div>
          <h2 className="text-xl font-bold lg:text-2xl">{title}</h2>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
};

const steps: ComponentProps<typeof Step>[] = [
  {
    num: 1,
    title: 'Define your routers and procedures.',
    description: (
      <>
        The first step into creating a tRPC API is to define your routers and
        procedures. Routers can have multiple procedures of type query, mutation
        or subscription and they can have an input typed with zod.
        <br /> <br />
        Routers can also merge together into one appRouter so you can separate
        your routers easily.
        <br /> <br />
        Your appRouter is exported with it&apos;s type and that is what is used
        to create your API endpoint and connect to the client!
      </>
    ),
    code: <First />,
  },
  {
    num: 2,
    title: 'Create your HTTP server.',
    description: (
      <>
        Next up, we plug in the appRouter into our HTTPServer method to create a
        server and we listen on port 3000, that&apos;s it! You now have a tRPC
        server running! <br /> <br />
        tRPC comes with many adapters to let you create an API server using your
        favorite framework like Express, Fastify, Next.js, AWS Lambda or you can
        create one using the standalone adapter!.
      </>
    ),
    code: <Second />,
    rightSide: true,
  },
  {
    num: 3,
    title: 'Connect your client and start querying!',
    description: (
      <>
        Now that we have the server running and exported the AppRouter type, we
        can use those to connect our client to the server and start querying
        data! <br /> <br /> We pass the AppRouter when creating the client to
        give us typescript autocompletion and intellisense that matches the
        backend API without needing any code generation!
      </>
    ),
    code: <Third />,
  },
];

export const QuickIntro: FC = () => {
  return (
    <section id="#quick-intro">
      <SectionTitle
        id="quick-intro"
        title={
          <>
            Simple to use with <br /> unmatched developer experience.
          </>
        }
      />
      <div className="flex flex-col gap-12 mt-6">
        {steps.map((step) => (
          <Step key={step.num} {...step} />
        ))}
      </div>
    </section>
  );
};
