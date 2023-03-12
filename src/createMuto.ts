import { Stringified, stringify } from './utils'

export type MutoMutations = {
  [K: string]: (arg?: any) => Promise<any>
}

export type Action<T> = {
  name: string
  mutationName: T
}

export type MutoActionCreators<Mutations extends MutoMutations> = {
  [Type in keyof Mutations & string]: Parameters<Mutations[Type]> extends []
    ? () => Stringified<Action<Type>>
    : (arg: Parameters<Mutations[Type]>[0]) => Stringified<{
        name: string
        mutationName: Type
        payload: Parameters<Mutations[Type]>[0]
      }>
}

export type Muto<Mutations extends MutoMutations> = {
  name: string
  mutations: Mutations
  actions: MutoActionCreators<Mutations>
}

export type MutoOptions<MutoMutations> = {
  name: string
  mutations: MutoMutations
}

export function createMuto<Mutations extends MutoMutations>({
  name,
  mutations,
}: MutoOptions<Mutations>): Muto<Mutations> {
  const mutationNames = Object.keys(mutations)

  const actionCreatorsByName: Record<string, Function> = {}

  mutationNames.forEach((mutationName) => {
    actionCreatorsByName[mutationName] = (payload: any) =>
      stringify(name, mutationName, payload)
  })

  return {
    name,
    mutations,
    actions: actionCreatorsByName as any,
  }
}
