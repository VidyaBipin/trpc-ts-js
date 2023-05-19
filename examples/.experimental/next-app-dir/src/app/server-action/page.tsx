import { ReactNode } from 'react';
import { FormWithUseActionExample } from './FormWithUseActionExample';
import { RawExample } from './RawExample';
import { RawFormExample } from './RawFormExample';
import { UseActionExample } from './UseActionExample';

export default async function Home() {
  const components: {
    Component: React.ComponentType;
    title: ReactNode;
  }[] = [
    {
      title: (
        <>
          <code>UseActionTestMutation</code> -{' '}
          <code>useAction(testAction)</code>
        </>
      ),
      Component: UseActionExample,
    },
    {
      title: (
        <>
          <code>RawTestMutation</code>
          Raw inline call <code>testAction(....)</code>
        </>
      ),
      Component: RawExample,
    },
    {
      title: (
        <>
          <code>&lt;form action=x</code> without any extras
        </>
      ),
      Component: RawFormExample,
    },
    {
      title: (
        <>
          <code>&lt;form&gt;</code> with <code>useAction</code>
        </>
      ),
      Component: FormWithUseActionExample,
    },
  ];
  return (
    <>
      <ul className="details-ul">
        {components.map((it, index) => (
          <details key={index}>
            <summary>{it.title}</summary>
            <div>
              <it.Component />
            </div>
          </details>
        ))}
      </ul>

      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: `
            .details-ul {
              display: grid;
              grid-gap: 1rem;
              list-style: none;
              margin: 0;
              padding: 0;
            }
        
            .details-ul > details {
              padding: 1rem 0.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 0.5rem;
            }
            .details-ul > details > summary {
              padding: 0.5rem;
            }
            .details-ul > details > div {
              padding: 1rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 0.25rem;
            }
          `,
        }}
      />
    </>
  );
}
