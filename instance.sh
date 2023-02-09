# Remove CLASP config file
rm .clasp.json || exit

# Create CLASP project
clasp create --type webapp || exit  

# Run CLASP installation helper
docker exec -it node node clasp_installation_helper.js || exit

# Push files to Google Apps Script
clasp push --force || exit

# Open the webapp in the browser
clasp open --webapp