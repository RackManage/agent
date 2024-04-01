<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>io.rackmanage.rmagent</string>
    <key>ProgramArguments</key>
    <array>
      <string>{{DATA_DIR}}/rmagent</string>
      <string>start-monitoring</string>
      <string>--path</string>
      <string>{{DATA_DIR}}/rmagent.db</string>
    </array>
    <key>StandardOutPath</key>
    <string>{{DATA_DIR}}/rmagent.log</string>
    <key>StandardErrorPath</key>
    <string>{{DATA_DIR}}/rmagent.error.log</string>
    <key>Debug</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
  </dict>
</plist>