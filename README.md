# FPAA Connect 2.0

**Official digital platform of Falakata Polytechnic Alumni Association (ESTD 2024)**
*“Connecting the Past. Empowering the Present. Building the Future.”*

A single-page web application built with plain HTML5, CSS3 and vanilla JavaScript — no build step, no framework. It runs fully in **demo mode** (sample data stored in your browser) and is ready to connect to **Supabase** for real data and authentication.

## Files

| File | Purpose |
|---|---|
| `index.html` | Main application (Home, My FPAA, About, Directory, Membership, Career & Jobs, Events, Donations, Achievements, Memories, Alumni Sponsored Scheme, Notices, Admin) |
| `login.html` | Sign in / Sign up page — email or mobile + password, show/hide password, Forgot Password with recovery key, Remember Me |
| `style.css` | Design system — glassmorphism, neumorphism, responsive rules |
| `script.js` | All application logic, organised in sections (AUTH, NAVIGATION, HOME, MY FPAA, … ADMIN, REPORTS, UTILITIES) |
| `supabase-config.js` | Supabase URL + anon key, logo path, contact details |
| `schema.sql` | Supabase tables (UUID ids), Row Level Security policies, verification function, directory view |
| `assets/fpaa-logo.png` | Official FPAA emblem (rounded tile, transparent corners) |
| `assets/fpaa-icon-192.png` | Favicon / phone home-screen icon |
| `assets/campus.jpg`, `assets/campus-sm.jpg` | Campus photo used behind the Home hero, login page, About header, footer and as the first gallery slide (small version loads on phones) |

## Demo accounts (demo mode only)

| Role | Email | Password |
|---|---|---|
| Alumni Member (linked, active) | `member@fpaa.in` | `Member@123` |
| New user (not linked) | `newuser@fpaa.in` | `Welcome@123` |
| Super Admin | `admin@fpaa.in` | `Admin@123` |
| Registration Committee | `registration@fpaa.in` | `Admin@123` |
| Finance Committee | `finance@fpaa.in` | `Admin@123` |
| Content Admin | `content@fpaa.in` | `Admin@123` |
| Committee Member | `committee@fpaa.in` | `Admin@123` |

To test membership linking, sign in as `newuser@fpaa.in` and link **FPAA-M-2024-000012** with mobile **9123456712**.

### Sign in, sign up & recovery key

- **Sign up** asks for **full name, mobile number and email**, plus a password (min. 8 characters, letters + numbers). If the email and mobile both match an approved membership record, it is linked automatically.
- **Sign in** with either the **email or the mobile number** and the password. Every password field has a show/hide (eye) button.
- **Forgot password** uses the **recovery key** — the first 4 letters of the registered name in CAPITALS + the last 4 digits of the registered mobile. Example: Rahul Barman, 98765 43206 → `RAHU3206`. After 5 wrong keys the account is locked for 15 minutes.
- Demo recovery key for `member@fpaa.in`: `RAHU3206`.

> ⚠️ Security note: the recovery key is derived from a member's name and phone number, so anyone who knows both can reset that member's password. Consider adding an email/SMS confirmation later for stronger protection.
Super Admin → Dashboard Overview → **Reset demo data** restores the original sample data.

Demo data: 170 alumni (167 active, 3 inactive) across all five departments, plus applications, payments, donations, events, jobs, achievements, memories, notices, support tickets, scheme applications and chat. All names, emails and numbers are fictitious.

---

## 1. Running locally

Quickest: double-click `login.html` (or `index.html`) — demo mode works straight from the file system. For Supabase mode and the most reliable printing/clipboard behaviour, serve it over `http://localhost` instead:

**Option A — Python (already on most computers)**
```bash
cd fpaa-connect
python3 -m http.server 8080
```
Open <http://localhost:8080/index.html>.

**Option B — Node.js**
```bash
cd fpaa-connect
npx serve .
```

**Option C — VS Code:** install the “Live Server” extension, right-click `index.html` → *Open with Live Server*.

Notes:
- Fonts (Inter/Manrope), Excel export (SheetJS) and the “Download Full FPAA Dashboard PPT” button (PptxGenJS) load from CDNs, so they need internet. Without internet, Excel falls back to an `.xls` file and CSV always works.
- Demo data lives in your browser’s localStorage. Different browsers/devices have separate demo data.

## 2. Connecting Supabase

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor**, paste all of `schema.sql`, and run it.
3. **Authentication → Providers:** enable *Email* (password). Optionally turn off *Confirm email* so new members can sign in right after sign up. Forgot password uses the `reset_password_with_master_key` function from `schema.sql` — no email or SMS provider needed.
4. **Authentication → URL Configuration:** add your site URL (e.g. `https://your-site.vercel.app`) and `…/login.html` as a redirect URL for password reset.
5. **Project Settings → API:** copy the **Project URL** and the **anon public** key into `supabase-config.js`:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi..."
   ```
   ⚠️ Never use the `service_role` key in any frontend file. `supabase-config.js` refuses to run with one.
6. Create your first user under **Authentication → Users**, then make them Super Admin in the SQL editor:
   ```sql
   update public.profiles set role = 'superadmin' where email = 'you@example.com';
   ```
7. Import your real members into the `members` table (Table Editor → Import CSV). Members link their account from **My FPAA → Link Your Membership** using membership number + registered mobile.

What changes in Supabase mode:
- Sign up / sign in use Supabase Auth (email + password; sign in with mobile via the `email_for_mobile` function). Recovery-key resets run in the database function `reset_password_with_master_key`.
- All reads/writes go to your database; Row Level Security in `schema.sql` decides what each role can see. The public directory uses the masked `member_directory` view; public verification uses the `verify_membership()` function.
- Members create their own login from the **Sign up** tab. Super Admin → Create Alumni Accounts prepares the profile/role; the member then signs up with the same email.
- Photos are stored as compressed data URLs in the tables. For large galleries, switching uploads to **Supabase Storage** is recommended.

## 3. Deploying to GitHub

```bash
cd fpaa-connect
git init
git add .
git commit -m "FPAA Connect 2.0"
git branch -M main
git remote add origin https://github.com/<your-account>/fpaa-connect.git
git push -u origin main
```
Only the anon key goes in `supabase-config.js`, so committing it is safe — RLS protects the data. You can also host directly on **GitHub Pages**: repository → Settings → Pages → Deploy from branch `main` / root.

## 4. Deploying to Vercel

1. Sign in at <https://vercel.com> with GitHub → **Add New… → Project** → import `fpaa-connect`.
2. Framework preset: **Other**. Build command: *(leave empty)*. Output directory: `.` (root).
3. Click **Deploy**. Your site will be at `https://fpaa-connect.vercel.app` (or add your own domain under Settings → Domains).
4. Put that URL in `supabase-config.js` → `PUBLIC_SITE_URL` (used on certificates, cards and verification links) and in Supabase → Authentication → URL Configuration.

Every `git push` to `main` redeploys automatically.

---

## Feature notes

- **Access control:** Directory, Career & Jobs, Events, Donations, Achievements, Memories, Alumni Sponsored Scheme and Notices require sign-in plus an active membership (or a committee role). Others are redirected to My FPAA with a clear message.
- **Roles:** Super Admin (everything, incl. account creation); Registration Committee (applications, members, schemes, support, full mobile numbers); Finance Committee (payments, donations, finance reports, support); Content Admin (feed, gallery, events, notices, achievements, memories, notifications, jobs); Committee Member (overview, schemes, jobs, reports).
- **Privacy:** mobile numbers are masked (`987654****`) everywhere except for Registration Committee/Super Admin; public verification shows only name, number, category, status and validity.
- **Verification links:** `index.html#verify=FPAA-M-2026-000001`.
- **Printing:** certificate (A4 landscape) and membership card (CR80 size) open the browser print dialog — choose *Save as PDF* for a digital copy.
- **Exports:** CSV and Excel from Members, Applications, Payments, Donations, Schemes and Finance Reports; PPT from the Home dashboard.
- **Logo:** the official emblem is `assets/fpaa-logo.png`. To update it, replace that file (keep the name) or change `LOGO_URL` in `supabase-config.js`.
