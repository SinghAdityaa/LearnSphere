# Windows quick start

Open PowerShell in the project folder and run:

```powershell
npm install
npm run install:all
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
docker compose up -d
npm run seed
npm run dev
```

Then open `http://localhost:5173`.

Use **Continue as demo student** or **Continue as demo admin** on the login page.
