$dbUser = 'postgres'
$dbPass = 'nebaz online1' # <--- IMPORTANT: REPLACE WITH YOUR ACTUAL POSTGRES PASSWORD
$dbName = 'azmera_db'
$newOwner = 'azmera_user'

# --- Set PGPASSWORD env var for psql commands --- 
# psql can read password from environment variable PGPASSWORD
# This is safer than putting password directly in command line for repeated calls
$env:PGPASSWORD = $dbPass

Write-Host "Getting list of public tables from $dbName..."
# Get all public tables
# -At ensures no header/footer, just plain data rows
$tables = psql -U $dbUser -d $dbName -At -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

# Loop through and alter ownership
$tables.Split("`n") | ForEach-Object {
    $tableName = $_.Trim()
    if ($tableName) {
        Write-Host "Changing ownership of table $tableName to $newOwner..."
        try {
            # Execute ALTER TABLE ... OWNER TO ... command
            # Double quotes around $tableName are for cases where table names might have special characters
            # The `" is an escaped double quote within the string
            psql -U $dbUser -d $dbName -c "ALTER TABLE public.`"$tableName`" OWNER TO $newOwner;" 2>&1 | Write-Host
        } catch {
            # Corrected variable reference: $_.Exception.Message
            Write-Host ("Error changing ownership for " + $tableName + ": " + $_.Exception.Message) -ForegroundColor Red
        }
    }
}

# --- IMPORTANT: Clear PGPASSWORD after use ---
Remove-Item Env:PGPASSWORD

Write-Host "Ownership transfer complete. You can now run 'npm run seed:dev'."
