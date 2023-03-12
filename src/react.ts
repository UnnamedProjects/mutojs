'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Muto } from './createMuto'
import { Stringified } from './utils'

type GetStringifiedType<T extends Stringified<any>> = T extends Stringified<
  infer U
>
  ? U
  : never

export type MutoActions<AppMuto extends Muto<any>> =
  AppMuto['actions'][keyof AppMuto['actions']]

export type StringifiedMutoActions<AppMuto extends Muto<any>> = ReturnType<
  MutoActions<AppMuto>
>

type MutoatorReturnValue<AppMuto extends Muto<any>> = ReturnType<
  AppMuto['mutations'][GetStringifiedType<
    // idk why this errors, types seem to work, but this above my TS pay grade
    // @ts-ignore
    StringifiedMutoActions<AppMuto>
  >['mutationName']]
>

export function useMuto<AppMuto extends Muto<any>>(
  url: string,
  action: StringifiedMutoActions<AppMuto>
): () => MutoatorReturnValue<AppMuto> {
  const router = useRouter()
  const [, startTransition] = useTransition()
  return useCallback(async () => {
    const resp = await fetch(url, {
      method: 'POST',
      body: action,
    })
    startTransition(() => {
      router.refresh()
    })
    return resp.json()
  }, [router, action]) as any
}
