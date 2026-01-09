# Fix Amharic JSON encoding
# This script reads the corrupted am.json and attempts to fix the encoding

Write-Host "Fixing Amharic encoding..." -ForegroundColor Yellow

# Read the corrupted file
$content = Get-Content "messages/am.json.corrupted" -Raw -Encoding UTF8

# The file appears to have double-encoded UTF-8
# Try to decode it properly
$bytes = [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($content)
$fixed = [System.Text.Encoding]::UTF8.GetString($bytes)

# Save the fixed version
$fixed | Out-File "messages/am-decoded.json" -Encoding UTF8 -NoNewline

Write-Host "Fixed file saved to messages/am-decoded.json" -ForegroundColor Green
Write-Host "Please review the file and if it looks correct, rename it to am.json" -ForegroundColor Cyan
