import Head from '@docusaurus/Head';
import { RadioGroup } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import Layout from '@theme/Layout';
import React, { useState } from 'react';
import { Button } from '../components/Button';

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
] as const satisfies { value: string; label: string; priceSuffix: string }[];

const tiers = [
  {
    name: 'Open Source',
    id: 'tier-free',
    price: 'Free. Forever.',
    description:
      'Our MIT-licensed packages are free to use, forever. But you can donate.',
    features: [
      'Access to all MIT-licensed tRPC packages',
      'Community support through Discord and GitHub Discussions',
    ],
    featured: false,
    cta: 'Donate',
    href: 'https://trpc.io/sponsor',
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$500', annually: '$4500' },
    description: 'A plan that scales with your rapidly growing business.',
    features: [
      'Prioritized feature requests',
      'Prioritized bug fixes',
      'Access to non-MIT-licensed tRPC packages',
      '48-hour support response time',
      'Up to 2 hours consulting each calendar month with a core team member (value $1,000)',
      'Optional: Your company featured on the tRPC website and GitHub readme',
    ],
    featured: false,
    cta: 'Buy plan',
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    price: 'Custom',
    description: 'Dedicated support and infrastructure for your company.',
    features: [
      'Tailored feature requests',
      'Prioritized bug fixes',
      'Access to all non-MIT-licensed tRPC packages',
      '24-hour support response time',
      'Dedicated Slack or Discord channel',
      'Optional: Your company featured on the tRPC website and GitHub readme',
    ],
    featured: true,
    href: 'mailto:sales@trpc.io?subject=Enterprise%20Plan%20Inquiry',
    cta: 'Contact sales',
  },
] as const satisfies {
  name: string;
  id: string;
  href: string;
  price: string | { monthly: string; annually: string };
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
}[];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function Pricing() {
  const [frequency, setFrequency] = useState(frequencies[0]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Pricing plans for teams of all sizes
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          tRPC is free to use, but we offer premium plans for teams that need
          more and want to support the project.
        </p>
        <div className="mt-16 flex justify-center">
          <RadioGroup
            value={frequency}
            onChange={setFrequency}
            className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
          >
            <RadioGroup.Label className="sr-only">
              Payment frequency
            </RadioGroup.Label>
            {frequencies.map((option) => (
              <RadioGroup.Option
                key={option.value}
                value={option}
                className={({ checked }) =>
                  classNames(
                    checked ? 'bg-indigo-600 text-white' : 'text-gray-500',
                    'cursor-pointer rounded-full px-2.5 py-1',
                  )
                }
              >
                <span>{option.label}</span>
              </RadioGroup.Option>
            ))}
          </RadioGroup>
        </div>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured ? 'bg-gray-900 ring-gray-900' : 'ring-gray-200',
                'rounded-3xl p-8 ring-1 xl:p-10',
              )}
            >
              <h3
                id={tier.id}
                className={classNames(
                  tier.featured ? 'text-white' : 'text-gray-900',
                  'text-lg font-semibold leading-8',
                )}
              >
                {tier.name}
              </h3>
              <p
                className={classNames(
                  tier.featured ? 'text-gray-300' : 'text-gray-600',
                  'mt-4 text-sm leading-6',
                )}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={classNames(
                    tier.featured ? 'text-white' : 'text-gray-900',
                    'text-4xl font-bold tracking-tight',
                  )}
                >
                  {typeof tier.price === 'string'
                    ? tier.price
                    : tier.price[frequency.value]}
                </span>
                {typeof tier.price !== 'string' ? (
                  <span
                    className={classNames(
                      tier.featured ? 'text-gray-300' : 'text-gray-600',
                      'text-sm font-semibold leading-6',
                    )}
                  >
                    {frequency.priceSuffix}
                  </span>
                ) : null}
              </p>

              <Button
                href={tier.href}
                aria-describedby={tier.id}
                variant="primary"
                className="w-full"
              >
                {tier.cta}
              </Button>
              <ul
                role="list"
                className={classNames(
                  tier.featured ? 'text-gray-300' : 'text-gray-600',
                  'mt-8 space-y-3 text-sm leading-6 xl:mt-10',
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={classNames(
                        tier.featured ? 'text-white' : 'text-indigo-600',
                        'h-6 w-5 flex-none',
                      )}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Layout
      title={`Pricing 💸`}
      description="End-to-end typesafe APIs made easy. Automatic typesafety & autocompletion inferred from your API-paths, their input data, &amp; outputs 🧙‍♂️"
    >
      <Head>
        <body className="pricing" />
      </Head>
      <Pricing />
    </Layout>
  );
}
