[Unit]
Description=Rack Manage Monitoring Service
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
ExecStart={{DATA_DIR}}/rmagent start-monitoring
WorkingDirectory={{DATA_DIR}}

[Install]
# User services are typically wanted by the default target for the user session
WantedBy=default.target
