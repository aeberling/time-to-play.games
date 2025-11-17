#!/bin/bash

# Determine the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start supervisord with the configuration file from the script directory
exec supervisord -c "${SCRIPT_DIR}/supervisord.conf"
