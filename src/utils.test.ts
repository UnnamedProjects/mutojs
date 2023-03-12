import { stringify, parse } from './utils'

describe('Utils', () => {
  describe('stringify()', () => {
    it('Should stringy an action', () => {
      const encoded = stringify('mutoName', 'actionName', { somePayload: 5 })
      expect(encoded).toMatchInlineSnapshot(
        `"{\\"name\\":\\"mutoName\\",\\"mutationName\\":\\"actionName\\",\\"payload\\":{\\"somePayload\\":5}}"`
      )
    })
  })

  describe(' parse()', () => {
    it('Should parse an action with a payload', () => {
      const encoded = stringify('mutoName', 'actionName', { somePayload: 5 })

      const action = parse(encoded)
      // test each object prop seperately to help verify type saftey
      expect(action.name).toEqual('mutoName')
      expect(action.mutationName).toEqual('actionName')
      expect(action.payload).toMatchObject({ somePayload: 5 })
    })

    it('Should parse an action without a payload', () => {
      const encoded = stringify('mutoName', 'actionName', undefined)

      const action = parse(encoded)
      // test each object prop seperately to help verify type saftey
      expect(action.name).toEqual('mutoName')
      expect(action.mutationName).toEqual('actionName')
      expect(action.payload).toBeUndefined()
    })
  })
})
