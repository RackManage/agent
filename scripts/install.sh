#!/bin/sh

{
    set -e
    SUDO=''
    if [ "$(id -u)" != "0" ]; then
        SUDO='sudo'
        echo "This script requires superuser access."
        echo "You will be prompted for your password by sudo."
        sudo -k
    fi

    $SUDO sh <<SCRIPT
    set -ex

    # Check if apt-transport-https is installed, install if not
    if ! dpkg -s apt-transport-https >/dev/null 2>&1; then
        apt-get update
        apt-get install -y apt-transport-https
    fi

    APT_VERSION=$(apt --version | cut -d ' ' -f 2)
    MIN_VERSION="1.1" # Example minimum version that supports signed-by, adjust as needed

    # If we're on a version of apt that supports signed-by, use it
    if dpkg --compare-versions "\$APT_VERSION" ge "\$MIN_VERSION"; then
        if ! grep -q "^deb https://agent.rackmanage.io/apt ./$" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
            echo "deb [signed-by=/usr/share/keyrings/rmagent.gpg] https://agent.rackmanage.io/apt ./" | tee /etc/apt/sources.list.d/rmagent.list
            curl -sL https://agent.rackmanage.io/apt/Release.key -o /usr/share/keyrings/rmagent.gpg
        fi
    else
        if ! grep -q "^deb https://agent.rackmanage.io/apt ./$" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
            echo "deb https://agent.rackmanage.io/apt ./" | tee /etc/apt/sources.list.d/rmagent.list
            curl -sL https://agent.rackmanage.io/apt/Release.key | apt-key add -
        fi
    fi

    apt-get update
    apt-get install -y libsecret-1-dev ipmitool rmagent

SCRIPT

  LOCATION=$(which rmagent)
  echo "rmagent installed to $LOCATION"
  rmagent version
}