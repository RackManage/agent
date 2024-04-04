import {expect, test} from '@oclif/test'

describe('start-agent', () => {
  test
  .stdout()
  .command(['start-agent'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['start-agent', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
