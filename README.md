# Muto.js

`muto.js` is a tool for creating type safe serialized actions to facility communication between React Server Components and React Client Components

## use at your own risk!

React Server Components are still _very_ experimental. I'm not even sure if this is lib is a good idea, but it was fun to make. :)

### Quick Start

```
pnpm i @up/mutojs
```

#### One time setup

###### Create a Muto collection

```ts
// src/app/muto.ts
import { createMuto } from '@up/mutojs'

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

// muto and action functions can only be imported in server components
export const { deleteTag } = muto.actions

// but types can be imported in both client and server
export type AppMuto = typeof muto
```

###### Create a Next RouteHandler for your muto

```ts
// src/app/api/mutations/route.ts
import { mutoRouteHandler } from '@up/mutojs'
import { muto } from '../../../muto.ts'

export async function POST(request: Request) {
  // responds to requests sent to http://<app_url>/api/mutations that contain a muto payload
  // and calls the appropriate Muto mutation function
  return mutoRouteHandler(request, { [muto.name]: muto })
}
```

#### Using Muto

###### Define a mutaiton

```ts
// src/app/muto.ts
import { createMuto } from '@up/mutojs'
import sql from '../db'

export const muto = createMuto({
  name: 'myMuto',
  mutations: {
    async createTag({ title }: { title: string }) {
      const resp = await sql`
          INSERT INTO tags (title) VALUES (${title})
          RETURNING id
        `
      // typeof resp = postgres.RowList<postgres.Row[]>
      return resp
    },
    async deleteTag(id: number) {
      ...
    },
  },
})

export const { createTag, deleteTag } = muto.actions
export type AppMuto = typeof muto
```

###### Use the action function

```tsx
// src/app/page.tsx
import sql from './db'
import { AddTagButton } from './AddTagButton'
import { createTag } from './muto'

// This is a Server Component
export default async function () {
  const tags = await sql`SELECT id, title FROM tags`

  return (
    <>
      // pass the result of the action creator to your client component
      <AddTagButton mutoAction={createTag({ title: 'wow' })} />
      {tags.map((tag) => (
        <div id={tag.id}>
          {tag.id}: {tag.title}
        </div>
      ))}
    </>
  )
}
```

###### useMuto to send mutation request to your RouteHandler

```tsx
// src/app/AddTagButton.tsx

// this is a client component
'use client'

import { AppMutoActions, useAppMuto } from '@/app/appMuto/useAppMuto'

export function AddTagButton({
  mutoAction,
}: {
  // type safe!
  // <AddTagButton mutoAction={deleteTag()} /> would type error
  mutoAction: AppMutoActions<'createTag'>
}) {
  // `useMuto` returns a callback that will trigger your mutation via the RouteHandler
  const mutate = useMuto(mutoAction)
  return (
    <button
      onClick={async () => {
        // typeof resp = postgres.RowList<postgres.Row[]>
        const resp = await mutate()
      }}
    >
      Add Tag
    </button>
  )
}
```
