const redis = require('async-redis')
const { GenericContainer, Wait } = require('testcontainers')
var expect = require('chai').expect
//
describe('RedisCache', () => {
  let container
  let redisClient

  before( async () => {
    container = await new GenericContainer('redis:6.2.5')
      .withEnv('DEBUG', 'testcontainers')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start()

    redisClient = await redis.createClient(container.getMappedPort(6379))
  })

  after(async () => {
    await redisClient.quit()
    await container.stop()
  })

  it('should cache a value', async () => {
    await redisClient.set('key', 'value')
    expect(await redisClient.get('key')).eq('value')
  })
})
