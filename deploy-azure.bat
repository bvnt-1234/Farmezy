@echo off
title Deploy Farmezy to Azure
echo Starting Farmezy 1-Click Azure Deployment...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-azure.ps1"
pause

