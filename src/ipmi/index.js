const util = require("util");
const { exec } = require("child_process");
const execPromise = util.promisify(exec);
const keytar = require('keytar');

async function ipmiAvailable() {
  // Check if `ipmitool` is installed in path / current directory
  try {
    await execPromise("ipmitool -h")
    return true;
  } catch (error) {
    try {
      await execPromise("./ipmitool -h");
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = {
  ipmiAvailable,
};