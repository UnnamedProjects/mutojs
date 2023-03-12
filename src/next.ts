export async function mutoRouteHandler(request: Request, muto: any) {
  const body: any = await request.json()
  if (muto[body.name]?.mutations[body.mutationName]) {
    const resp = await muto[body.name].mutations[body.mutationName](
      body.payload
    )
    return new Response(JSON.stringify(resp))
  }

  return new Response('No mutation done')
}
