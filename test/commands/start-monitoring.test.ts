import {expect, test} from '@oclif/test'

describe('start-monitoring', () => {
  test
  .stdout()
  .command(['start-monitoring'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['start-monitoring', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
