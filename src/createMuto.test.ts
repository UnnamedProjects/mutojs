import { createMuto } from './createMuto'
import { useMuto } from './react'
import { stringify } from './utils'

describe('createMuto()', () => {
  it('should generate muto actions', () => {
    const mockFn = jest.fn<number, []>()
    const muto = createMuto({
      name: 'test',
      mutations: {
        async myMutation() {
          return mockFn()
        },
      },
    })

    expect(muto.actions.myMutation()).toBe(
      stringify('test', 'myMutation', undefined)
    )
  })

  it('should generate muto mutations', async () => {
    const mockFn = jest.fn()
    const muto = createMuto({
      name: 'test',
      mutations: {
        async myMutation(value: number) {
          mockFn()
          return value.toString()
        },
      },
    })

    const result = await muto.mutations.myMutation(1337)
    expect(mockFn).toHaveBeenCalled()
    expect(result).toBe('1337')
  })
})
