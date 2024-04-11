# This script automates the signing process for use with a Certum Cloud Code Signing Certificate.
# It will automatically download windows binaries for a specified version of the installer, sign them, and then upload them back to S3.
# This script is intended to be run on a Windows machine with the AWS CLI, SignTool, and Certum SmartSign installed.
#
# Usage: .\sign-windows-installer.ps1 -version <version> -sha <sha> [-promote <channel>]
#   -version: The version of the installer to sign. This should be the version number without the 'v' prefix.
#   -sha: The SHA of the installer to sign. This should be the 7 character SHA of the commit hash.
#   -promote: Optional. If specified, the signed installer will be promoted to the specified channel after signing.
#
# Example: .\sign-windows-installer.ps1 -version 1.0.0 -sha 1234567

param(
    [Parameter(Mandatory=$true)]
    [string]$version,
    [Parameter(Mandatory=$true)]
    [string]$sha,
    [string]$promote
)

$ErrorActionPreference = "Stop"

# Check if the AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI is not installed. Please install the AWS CLI before running this script."
    exit 1
}

# Check if SignTool is installed
if (-not (Get-Command signtool -ErrorAction SilentlyContinue)) {
    Write-Host "SignTool is not installed. Please install SignTool before running this script."
    exit 1
}

# If channel is specified, check if it is a valid channel
if ($promote -and $promote -notin @("beta", "stable")) {
    Write-Host "Invalid channel. Valid channels are 'beta' and 'stable'."
    exit 1
}

# Download the installer binaries from S3 to temp directory
$installerDir = "$env:TEMP\rmagent-installers"

Write-Host "Downloading installer binaries for version $version..."
aws s3 sync s3://rmagent/versions/$version/$sha/ $installerDir --exclude "*" --include "rmagent-v$version-$sha-x64.exe" --include "rmagent-v$version-$sha-x86.exe"

# Sign the installer binaries
Write-Host "Signing installer binaries..."
signtool sign /n "Carter Roeser" /fd SHA256 /tr http://time.certum.pl /td sha256 /v $installerDir/rmagent-v$version-$sha-x64.exe $installerDir/rmagent-v$version-$sha-x86.exe

# Upload the signed installer binaries back to S3
Write-Host "Uploading signed installer binaries..."
aws s3 sync $installerDir s3://rmagent/versions/$version/$sha/ --exclude "*" --include "rmagent-v$version-$sha-x64.exe" --include "rmagent-v$version-$sha-x86.exe"

Write-Host "Signing complete."

# If promote is specified, promote the signed installer to the specified channel
if ($promote) {
    Write-Host "Promoting signed installer to $promote channel..."
    aws s3 cp s3://rmagent/versions/$version/$sha/rmagent-v$version-$sha-x64.exe s3://rmagent/channels/$promote/rmagent-x64.exe --copy-props none
    aws s3 cp s3://rmagent/versions/$version/$sha/rmagent-v$version-$sha-x86.exe s3://rmagent/channels/$promote/rmagent-x86.exe --copy-props none
    Write-Host "Promotion complete."
}

exit 0
