import {Command} from '@oclif/core'

import { manageService } from '../../service'

export default class Uninstall extends Command {
  static description = 'Uninstalls the agent service'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    await manageService("uninstall", this.config.root);
  }
}
