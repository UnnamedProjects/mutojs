# Muto.js

`muto.js` is a tool for dispatching actions from React Client Components to React Server Components in a type safe way

## Use at your own risk!

React Server Components are still _very_ experimental. I'm not even sure if this is lib is a good idea, but it was fun to make. :)

### Quick Start

```
pnpm i @up/mutojs
```

##### Create a mutation collection

```ts
// src/app/muto.ts
import { createMuto } from '@up/mutojs'
import sql from '../db'

export const muto = createMuto({
  name: 'myMuto',
  mutations: {
    async deleteTag(id: number) {
      const resp = await sql`
        DELETE FROM tags
        WHERE id = ${id};
      `
      return resp
    },
  },
})

// export your action creators
// Note: muto and actions can only be imported in server components
export const { deleteTag } = muto.actions
```

##### Use action creators to generate serialized payloads

```tsx
// src/app/page.tsx
import sql from './db'
import { DeleteTagButton } from './DeleteTagButton'
import { deleteTag } from './muto'

// This is a Server Component
export default async function () {
  const tags = await sql`SELECT id, title FROM tags`
  return (
    <div>
      {tags.map((tag) => (
        <DeleteTagButton mutoDeleteTagAction={deleteTag(tag.id)} />
      ))}
    </div>
  )
}
```

##### Dispatch the action payload from a Client component

```tsx
// src/app/DeleteTagButton.tsx

// this is a client component
'use client'

import { AppMutoActions, useAppMuto } from '@/app/appMuto/useAppMuto'
export function DeleteTagButton({ mutoDeleteTagAction }) {
  const mutate = useAppMuto(mutoDeleteTagAction)
  return <button onClick={mutate}>Remove Tag</button>
}
```

##### Create a Next RouteHandler to respond to dispatched actions

```ts
// src/app/api/mutations/route.ts
import { mutoRouteHandler } from '@up/mutojs'
import { muto } from '../../../muto.ts'

export async function POST(request: Request) {
  return mutoRouteHandler(request, { [muto.name]: muto })
}
```

##### And that's it! but how does it work?

The `deleteTag` action function creates a serialized payload that can be passed from a Server Component to a Client Component.
This payload contains:

```
{
    name: 'myMuto', // the name of your muto collection
    mutationName: 'deleteTag', // a function to call in that collection
    payload: <tag.id> // The args to call the mutation function with.  In this case a tag id
}
```

The `useAppMuto` hook does two things:

1. Sends a fetch request with your payload, which will be handled by the Next RouteHandler
2. Calls `router.refresh()`, causing the app to re-render displaying the results of the mutation

The `mutoRouteHandler` takes the payload and uses it to call the appropriate mutation function, returning it's result!

#### Typescript Support

##### Create an AppMuto type

```ts
import { createMuto } from '@up/mutojs'

export const muto = createMuto({
  name: 'myMuto',
  mutations: {
    async createTag(title) {
      const resp = await sql`
          INSERT INTO tags (title) VALUES (${title})
          RETURNING id
        `
      // resp's type is postgres.RowList<postgres.Row[]>
      return resp
    },
  },
})

export const { createTag } = muto.actions

// Create a type for your application's Muto
// Types can be imported in both client and server
export type AppMuto = typeof muto
```

##### Use AppMuto to define typesafe helpers

```ts
// src/app/useAppMuto.ts
import {
  useMuto,
  StringifiedMutoActions,
  MutoActionKeys,
  MutoAppActions,
} from '@up/mutojs'

import type { AppMuto } from '.muto.ts'

// Should be the path to your Next Route Handler
const baseUrl = 'http://localhost:3000/api/mutations'

export const useAppMuto = (action: StringifiedMutoActions<AppMuto>) =>
  useMuto<AppMuto>(baseUrl, action)

export type AppMutoActions<T extends MutoActionKeys<AppMuto>> = MutoAppActions<
  AppMuto,
  T
>
```

##### Use helpers in your Client Components to add type safety

```tsx
// src/app/AddTagButton.tsx

'use client'

import { AppMutoActions, useAppMuto } from '@/app/appMuto/useAppMuto'

interface AddTagButtonProps {
  // AddTagButton only accepts `createTag` action payloads!
  mutoAction: AppMutoActions<'createTag'>
}

export function AddTagButton({ mutoAction }: AddTagButtonProps) {
  const mutate = useAppMuto(mutoAction)
  return (
    <button
      onClick={async () => {
        // resp's type is postgres.RowList<postgres.Row[]>!
        const resp = await mutate()
      }}
    >
      Add Tag
    </button>
  )
}
```

```tsx
// src/app/page.tsx
export default async function () {
  // TS ERROR!  deleteTag is not assignable to type createTag
  return <AddTagButton mutoAction={createTag('My cool tag!')} />
}
```
