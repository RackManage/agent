[Unit]
Description=Rack Manage Monitoring Service
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
ExecStart={{EXE_PATH1}} {{EXE_PATH2}} start-monitoring --path {{DATA_DIR}}/rackmanage-agent.db
WorkingDirectory={{DATA_DIR}}
StandardOutput=append:{{DATA_DIR}}/rackmanage-agent.log
StandardError=append:{{DATA_DIR}}/rackmanage-agent.error.log

# Security settings more suited for a system-wide service
ProtectSystem=full
ProtectHome=read-only
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target