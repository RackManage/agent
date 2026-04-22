import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir, platform, userInfo } from 'node:os'
import { join } from 'node:path'

const dbName = 'rackmanage-agent.db'

function linuxHomeForUser(username: string): string {
  try {
    const passwdEntry = execFileSync('getent', ['passwd', username], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const homeDirectory = passwdEntry.split(':')[5]
    if (homeDirectory) {
      return homeDirectory
    }
  } catch {}

  try {
    const passwdEntry = readFileSync('/etc/passwd', 'utf8')
      .split('\n')
      .find((line) => line.startsWith(`${username}:`))
    const homeDirectory = passwdEntry?.split(':')[5]
    if (homeDirectory) {
      return homeDirectory
    }
  } catch {}

  return join('/home', username)
}

/**
 * Get the paths for the user and system data directories
 * based on the current operating system
 * @returns {object} An object containing the paths
 */
function dataPath() {
  let userPath

  let systemPath
  switch (platform()) {
    case 'darwin': {
      userPath = join(homedir(), 'Library', 'Application Support', 'RackManage')
      systemPath = join('/', 'Library', 'Application Support', 'RackManage')
      break
    }

    case 'linux': {
      userPath = (userInfo().uid === 0 && process.env.SUDO_USER) ?
        join(linuxHomeForUser(process.env.SUDO_USER), '.config', 'RackManage')
      :
        join(homedir(), '.config', 'RackManage')
      systemPath = join('/var/lib', 'RackManage')
      break
    }

    case 'win32': {
      userPath = join(process.env.APPDATA || homedir(), 'RackManage')
      systemPath = join(process.env.ProgramData || String.raw`C:\ProgramData`, 'RackManage')
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
