$token = "12345678"
$token | Out-File -FilePath "$env:TEMP\ryda_token.txt" -NoNewline -Encoding UTF8
Get-Content "$env:TEMP\ryda_token.txt" | ForEach-Object { Write-Host "Token: '$_'" }