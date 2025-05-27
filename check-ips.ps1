# This script shows the current IP addresses
Write-Host "Current IP Addresses:"
Write-Host "===================="
$wslIP = (wsl -- ip -4 addr show eth0 | Select-String -Pattern "inet" | ForEach-Object { $_.ToString().Split()[1].Split("/")[0] }).Trim()
Write-Host "WSL IP: $wslIP"
$windowsIP = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.IPAddress -ne "127.0.0.1"} | Select-Object -First 1).IPAddress
Write-Host "Windows IP: $windowsIP"
Write-Host ""
Write-Host "Port Forwarding Configuration:"
Write-Host "===================="
netsh interface portproxy show all
