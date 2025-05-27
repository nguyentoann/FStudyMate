# This script sets up port forwarding from Windows to WSL
# Run this script as Administrator

# Get WSL IP address automatically
$wslIP = (wsl -- ip -4 addr show eth0 | Select-String -Pattern "inet" | ForEach-Object { $_.ToString().Split()[1].Split("/")[0] }).Trim()
Write-Host "Detected WSL IP: $wslIP"

# Get Windows IP address (first non-loopback IPv4 address)
$windowsIP = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.IPAddress -ne "127.0.0.1"} | Select-Object -First 1).IPAddress
Write-Host "Detected Windows IP: $windowsIP"

# Remove existing port forwards if any
Write-Host "Removing any existing port forwards..."
netsh interface portproxy reset

# Set up port forwarding for Frontend (3000)
Write-Host "Setting up port forwarding for frontend (port 3000)..."
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=$wslIP connectport=3000

# Set up port forwarding for Backend (8080)
Write-Host "Setting up port forwarding for backend (port 8080)..."
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8080 connectaddress=$wslIP connectport=8080

# Display the current port forwarding configuration
Write-Host "Port forwarding configuration:"
netsh interface portproxy show all

# Ensure Windows Firewall allows these ports
Write-Host "Configuring Windows Firewall..."
New-NetFirewallRule -DisplayName "WSL Frontend Port 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "WSL Backend Port 8080" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -ErrorAction SilentlyContinue

# Create a helper script to check current IPs
# Use Set-Content instead of a here-string to avoid escaping issues
$checkIpsScript = @"
# This script shows the current IP addresses
Write-Host "Current IP Addresses:"
Write-Host "===================="
`$wslIP = (wsl -- ip -4 addr show eth0 | Select-String -Pattern "inet" | ForEach-Object { `$_.ToString().Split()[1].Split("/")[0] }).Trim()
Write-Host "WSL IP: `$wslIP"
`$windowsIP = (Get-NetIPAddress | Where-Object {`$_.AddressFamily -eq "IPv4" -and `$_.IPAddress -ne "127.0.0.1"} | Select-Object -First 1).IPAddress
Write-Host "Windows IP: `$windowsIP"
Write-Host ""
Write-Host "Port Forwarding Configuration:"
Write-Host "===================="
netsh interface portproxy show all
"@
Set-Content -Path "check-ips.ps1" -Value $checkIpsScript

Write-Host "Setup complete. WSL services should now be accessible from external devices."
Write-Host "Access your frontend at: http://$windowsIP:3000"
Write-Host "Access your backend at: http://$windowsIP:8080"
Write-Host ""
Write-Host "If your IP addresses change, run this script again."
Write-Host "To check current IPs anytime, run: .\check-ips.ps1" 