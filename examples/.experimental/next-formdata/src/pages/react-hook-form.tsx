import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { FormProvider, UseFormProps, useForm } from 'react-hook-form';
import { z } from 'zod';
import { uploadFileSchema } from '~/utils/schemas';
import { trpc } from '~/utils/trpc';

/**
 * zod-form-data wraps zod in an effect where the original type is a `FormData`
 */
type UnwrapZodEffect<T extends z.ZodType> = T extends z.ZodEffects<
  infer U,
  any,
  any
>
  ? U
  : T;

type GetInput<T extends z.ZodType> = UnwrapZodEffect<T>['_input'];

function useZodFormData<TSchema extends z.ZodType>(
  props: {
    schema: TSchema;
  } & Omit<UseFormProps<GetInput<TSchema>>, 'resolver'>,
) {
  const formRef = useRef<HTMLFormElement>(null);
  const _resolver = zodResolver(props.schema, undefined, {
    rawValues: true,
  });

  const form = useForm<GetInput<TSchema>>({
    ...props,
    resolver: (_, ctx, opts) => {
      if (!formRef.current) {
        return {
          values: {},
          errors: {
            root: {
              message: 'Form not mounted',
            },
          },
        };
      }
      const values = new FormData(formRef.current);
      const result = _resolver(values, ctx, opts);

      return result;
    },
  });

  return { ...form, formRef };
}

export default function Page() {
  const mutation = trpc.room.sendMessage.useMutation({
    onError(err) {
      alert('Error from server: ' + err.message);
    },
  });

  const form = useZodFormData({
    schema: uploadFileSchema,
    defaultValues: {
      name: 'whadaaaap',
    },
  });

  const [noJs, setNoJs] = useState(false);

  return (
    <>
      <h2 className="text-3xl font-bold">Posts</h2>

      <FormProvider {...form}>
        <form
          method="post"
          action={`/api/trpc/${mutation.trpc.path}`}
          encType="multipart/form-data"
          onSubmit={(_event) => {
            if (noJs) {
              return;
            }
            form.handleSubmit(async (values, event) => {
              await mutation.mutateAsync(new FormData(event?.target));
            })(_event);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          ref={form.formRef}
        >
          <fieldset>
            <legend>Form with file upload</legend>
            <div style={{}}>
              <label htmlFor="name">Enter your name</label>
              <input {...form.register('name')} />
              {form.formState.errors.name && (
                <div>{form.formState.errors.name.message}</div>
              )}
            </div>

            <div>
              <label>Required file, only images</label>
              <input type="file" {...form.register('image')} />
              {form.formState.errors.image && (
                <div>{form.formState.errors.image.message}</div>
              )}
            </div>

            <div>
              <label>Post without JS</label>
              <input
                type="checkbox"
                checked={noJs}
                onChange={(e) => setNoJs(e.target.checked)}
              />
            </div>
            <div>
              <button type="submit" disabled={mutation.status === 'loading'}>
                submit
              </button>
            </div>
          </fieldset>
        </form>

        {mutation.data && (
          <fieldset>
            <legend>Upload result</legend>
            <ul>
              <li>
                Document:
                {mutation.data.document ? (
                  <a href={mutation.data.document.url}>
                    {mutation.data.document.name}
                  </a>
                ) : (
                  <em>Empty</em>
                )}
              </li>
              <li>
                Image: <br />
                <img
                  src={mutation.data.image.url}
                  alt={mutation.data.image.url}
                />
              </li>
            </ul>
          </fieldset>
        )}
      </FormProvider>
    </>
  );
}
