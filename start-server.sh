#!/bin/bash

# Start supervisord with the configuration file
exec supervisord -c /workspace/supervisord.conf
