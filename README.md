# Powerball
- Generates a random Powerball slip

Full-stack TypeScript project:
- **Client**: React + Vite + TypeScript
- **Server**: Node.js + Express + TypeScript + Jest tests

**Instructions**
- Clone the repo
- 'npm i' from root
- 'npm run dev' from root
- 'npm test' to run backend Jest tests

To test FS module API's: 
1. Open Bash shell
2. BASE_URL="http://localhost:4003/api"

- Generate a new slip -
- curl -s -X GET "$BASE_URL/generate-powerball-slip"

- Load all slips -
- curl -s -X GET "$BASE_URL/load-powerball-slips"

- Delete slip at index 0 -
- curl -s -X DELETE "$BASE_URL/delete-powerball-slip/0"

- Load all slips again (after deletion) -
- curl -s -X GET "$BASE_URL/load-powerball-slips"

