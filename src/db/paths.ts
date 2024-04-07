import { existsSync } from 'node:fs'
import { homedir, platform, userInfo } from 'node:os'
import { join } from 'node:path'

const dbName = 'rmagent.db'

/**
 * Get the paths for the user and system data directories
 * based on the current operating system
 * @returns {Object} An object containing the paths
 */
function dataPath() {
  let userPath

  let systemPath
  switch (platform()) {
    case 'win32': {
      userPath = join(process.env.APPDATA || homedir(), 'RackManage')
      systemPath = join(process.env.ProgramData || "C:\\ProgramData", 'RackManage')
      break
    }

    case 'darwin': {
      userPath = join(homedir(), 'Library', 'Application Support', 'RackManage')
      systemPath = join('/', 'Library', 'Application Support', 'RackManage')
      break
    }

    case 'linux': {
      userPath = (userInfo().uid === 0 && process.env.SUDO_USER) ?
        join('/home', process.env.SUDO_USER, '.config', 'RackManage')
      :
        userPath = join(homedir(), '.config', 'RackManage');
      systemPath = join('/var/lib', 'RackManage')
      break
    }
  }

  if (!userPath || !systemPath) {
    throw new Error('Unsupported platform')
  }

  return {systemPath, userPath}
}

/**
 * Find the path to the current database file
 * @returns {string} The path to the database file
 */
function findDatabasePath(): string {
  const {systemPath, userPath} = dataPath()

  return (existsSync(join(systemPath, dbName))) ?
    join(systemPath, dbName)
  :
    join(userPath, dbName);
}

export {
  dataPath,
  dbName,
  findDatabasePath,
}
