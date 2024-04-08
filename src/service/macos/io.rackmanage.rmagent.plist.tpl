<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>io.rackmanage.rmagent</string>
    <key>Program</key>
    <string>{{EXE_PATH1}}</string>
    <key>ProgramArguments</key>
    <array>
      <string>{{EXE_PATH1}}</string>
      <string>{{EXE_PATH2}}</string>
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
    <key>WorkingDirectory</key>
    <string>{{WORKING_DIR}}</string>
  </dict>
</plist>