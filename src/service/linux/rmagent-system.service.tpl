[Unit]
Description=Rack Manage Monitoring Service
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
ExecStart={{DATA_DIR}}/rmagent start-monitoring
WorkingDirectory={{DATA_DIR}}

# Security settings more suited for a system-wide service
ProtectSystem=full
ProtectHome=yes
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target