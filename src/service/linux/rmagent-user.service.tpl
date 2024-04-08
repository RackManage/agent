[Unit]
Description=Rack Manage Monitoring Service
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
ExecStart={{EXE_PATH1}} {{EXE_PATH2}} start-monitoring --path {{DATA_DIR}}/rmagent.db
WorkingDirectory={{DATA_DIR}}
StandardOutput=append:{{DATA_DIR}}/rmagent.log
StandardError=append:{{DATA_DIR}}/rmagent.error.log

[Install]
# User services are typically wanted by the default target for the user session
WantedBy=default.target
