# JobHunter Frontend

React 18 + TypeScript + Vite + Ant Design 5 + Redux Toolkit

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point to your Spring Boot backend

# 3. Run dev server
npm run dev
```

## Stack
- React 18 + React Router 6
- TypeScript (strict)
- Vite 5
- Ant Design 5
- Redux Toolkit
- Axios (with JWT refresh interceptor)
- Day.js

## Pages
### Client
- `/` Home with job search
- `/jobs` Job listing with filters
- `/jobs/:id` Job detail + Apply
- `/companies` Company listing
- `/resumes` My applications (auth required)
- `/login` + `/register`

### Admin (`/admin/*`)
- Dashboard, Jobs, Companies, Resumes, Users, Skills, Roles & Permissions

## API Base URL
Set `VITE_API_URL=http://localhost:8080` in `.env`
