const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: 'sh4up2hi',
  dataset: 'fitness-addiction',
  useCdn: false,
  token: 'skokrouyzZlpgCjdcrtlmKrpviLUNP8eYXw5X5KMpTUdYpv6mtr51JaKhlABclsEdDREW29IDnw1qwv6YDWyYBd5mvblzMAx1t91hVaLt2hbiXKtCOpfnHQ54avu10PDxcz1akfBZieqYMxl48raf5IELwtvBER9zS19KvNeXqAESbWweMfQ'
})

export default client
