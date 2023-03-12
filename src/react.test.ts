import { renderHook } from '@testing-library/react'

import { createMuto } from './createMuto'
import { useMuto } from './react'
import { useTransition } from 'react'

// @ts-ignore TODO rbaxter - remove this later, or mock globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve('Nice!'),
  })
)

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    refresh: jest.fn(),
  }),
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: jest.fn().mockReturnValue([1337, jest.fn()]),
}))

describe('useMuto()', () => {
  it('should return a callback to execute a mutation', async () => {
    const muto = createMuto({
      name: 'test',
      mutations: {
        async myMutation(value: number) {
          return value.toString()
        },
      },
    })

    const { result } = renderHook(() =>
      useMuto<typeof muto>(muto.actions.myMutation(1337))
    )
    expect(result.current).toBeDefined()
  })

  it('callback should make a fetch request when executed', async () => {
    const muto = createMuto({
      name: 'test',
      mutations: {
        async myMutation(value: number) {
          return value.toString()
        },
      },
    })

    const { result } = renderHook(() =>
      useMuto<typeof muto>(muto.actions.myMutation(1337))
    )
    const resp = await result.current()
    expect(resp).toEqual('Nice!')
  })
})
