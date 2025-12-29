# Safety First - Throwaway Prototype

**⚠️ THROWAWAY CODE - DELETE BEFORE PRODUCTION IMPLEMENTATION**

This is a pure frontend HTML/CSS/JavaScript prototype for demo and UX validation purposes only.

---

## What This Prototype Does

- **Public Incident Reporting** - No login required, mobile camera support
- **Admin Dashboard** - Fake login, role-based views (Safety Officer vs Manager)
- **Mock Data** - Hardcoded incidents, new reports saved in browser memory only
- **Hebrew RTL** - Right-to-left layout approximation

**No Backend:** No API calls, no database, no real authentication. Session data lost on browser refresh.

---

## How to Run Locally

### Option 1: Open Directly in Browser

1. Navigate to the `prototype` folder
2. Double-click `index.html`
3. Your default browser will open the prototype

### Option 2: Use a Local Web Server (Recommended for Camera Testing)

Camera features work best with a local server:

```bash
# Using Python 3
cd prototype
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

---

## How to Access from Mobile Device (Same Network)

To test the prototype on your phone while running on your computer:

### Step 1: Start Local Server on Your Computer

```bash
cd prototype
python -m http.server 8000
```

### Step 2: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address (e.g., `192.168.1.100`)

### Step 3: Access from Mobile

On your phone's browser, navigate to:
```
http://192.168.1.100:8000
```
(Replace `192.168.1.100` with YOUR computer's IP address)

**Important:**
- Your phone and computer must be on the **same WiFi network**
- Some corporate/public WiFi networks block device-to-device connections
- Camera will only work over HTTPS or localhost (if your browser complains, use `http://` anyway for demo purposes)

---

## How to Use the Prototype

### Public Reporting (No Login)

1. Open `index.html`
2. Click **"דווח על אירוע בטיחות"** (Report Safety Incident)
3. Fill out the form:
   - Tap camera icon to take photo (mobile) or upload image (desktop)
   - Select location and severity
   - Optionally enter your name (leave blank for anonymous)
   - Add description
4. Submit - incident saved to browser memory

### Admin Login (Fake)

1. From landing page, click **"כניסה למערכת"** (Login to System)
2. Select role:
   - **ממונה בטיחות** (Safety Officer) - See all incidents, can assign
   - **מנהל** (Manager) - See only assigned incidents, can resolve
3. Enter any name (no validation)
4. Click login

### Safety Officer View

- See **all incidents** (mock data + newly created)
- Click incident to view details
- Click **"הקצה"** (Assign) to assign to a manager
- View status of all incidents

### Manager View

- See **only incidents assigned to you** (filtered by name you entered)
- Click incident to view details
- Click **"סמן כטופל"** (Mark as Resolved) to close incident

---

## Mock Data Included

The prototype includes 8 pre-loaded incidents:
- Various severities (near-miss, minor, major, critical)
- Different locations (production line, loading dock, warehouse)
- Different statuses (new, assigned, resolved)
- Some assigned to "Dana", "Moshe", "Ronen"

**New incidents you create** are saved in `sessionStorage` and will appear in the list.

**On browser refresh:** All new incidents are lost (mock data remains).

---

## Files in This Prototype

```
prototype/
├── README.md              # This file
├── index.html             # Landing page
├── public-app.html        # Public incident reporting form
├── admin-login.html       # Fake login screen
├── admin-dashboard.html   # Incident list (role-filtered)
├── incident-detail.html   # Incident detail view
├── styles.css             # Shared CSS (RTL, mobile-first)
└── app.js                 # Shared JS (mock data, camera, storage)
```

---

## Testing Checklist

- [ ] Open on desktop browser - navigation works
- [ ] Open on mobile browser - layout is responsive
- [ ] Submit public incident report - appears in admin dashboard
- [ ] Take photo with mobile camera - preview shows
- [ ] Login as Safety Officer - see all incidents
- [ ] Assign incident to manager - status updates
- [ ] Login as Manager (same name) - see only assigned incidents
- [ ] Mark incident as resolved - status updates
- [ ] Access from another device on same network - works

---

## Known Limitations (It's a Throwaway!)

- No real authentication or security
- Data lost on refresh
- No form validation (accepts empty submissions)
- Hebrew text is placeholder/mixed quality
- No error handling
- Camera might not work on some browsers without HTTPS
- No accessibility features
- No loading states or animations
- Code quality is intentionally low (throwaway)

---

## After Prototype Validation

**DELETE THIS ENTIRE FOLDER** before starting real implementation.

Your real implementation will use:
- Vite + React + TypeScript
- Supabase for backend
- Material UI components
- Proper authentication
- Real database storage

This prototype is purely for:
- Validating UX flows
- Testing mobile usability
- Getting stakeholder feedback
- Understanding requirements better

---

## Questions or Issues?

This is throwaway code for demo purposes. Don't invest time debugging - just validate the UX concepts and move to real implementation.
