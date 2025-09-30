# CIY.CLUB Student Reports System

ระบบติดตามความก้าวหน้านักเรียน CIY.CLUB - React TypeScript Application

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
ciy-student-reports/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components (Badge, Button, Input, Select)
│   │   ├── cards/           # StudentProfile
│   │   ├── tables/          # StudentTable, ReportsTable
│   │   ├── modals/          # AddReportModal, AddStudentModal
│   │   ├── Header.tsx       # App header with navigation
│   │   └── Toast.tsx        # Toast notification system
│   ├── routes/              # Page components
│   │   ├── Landing.tsx      # Homepage
│   │   ├── ParentLogin.tsx  # Parent portal
│   │   ├── CoachLogin.tsx   # Coach portal
│   │   ├── Students.tsx     # Students management
│   │   └── StudentDetail.tsx # Individual student view
│   ├── hooks/               # Custom hooks
│   │   ├── useI18n.ts       # Translation hook
│   │   ├── useStudents.ts   # Students data management
│   │   ├── useReports.ts    # Reports data management
│   │   └── useFloatingHScroll.ts # Floating scrollbar
│   ├── services/            # Data services
│   │   ├── api.ts           # API calls
│   │   └── mapper.ts        # CSV header mapping
│   ├── store/               # Zustand state management
│   │   └── authStore.ts     # Authentication & language state
│   ├── styles/              # CSS
│   │   └── globals.css      # Global styles + Tailwind
│   ├── config.ts            # App configuration
│   ├── types.ts             # TypeScript interfaces
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔧 Features

### 🎯 Core Functionality
- **Parent Portal**: Login with Coder ID + Parent Password
- **Coach Portal**: Management interface for all students
- **Student Reports**: View and manage progress reports
- **Bilingual Support**: Thai/English language toggle
- **Responsive Design**: Mobile-friendly interface

### 📊 Data Management
- **CSV Integration**: Fetches data from Google Sheets
- **Real-time Updates**: Submit reports via Google Apps Script
- **Flexible Headers**: Automatic CSV column mapping
- **Search & Filter**: Find students quickly
- **Sort Tables**: Click column headers to sort

### 🔐 Authentication
- **Session Management**: Persistent login state
- **Role-based Access**: Parent vs Coach permissions
- **Secure Login**: Password-protected access

## 🎨 UI/UX Features

- **Glass Morphism**: Modern frosted glass design
- **Smooth Animations**: Toast notifications and transitions
- **Custom Badges**: Status indicators with proper styling
- **Floating Scrollbar**: Enhanced table navigation (optional)
- **Loading States**: User feedback during data fetching

## 🌐 Configuration

### Environment Variables
ไฟล์ `src/config.ts` มีการตั้งค่าสำคัญ:

```typescript
export const CONFIG = {
  coachPassword: "Ciy.club@2025",                    // Coach login password
  studentsCsv: "https://docs.google.com/...",        // Students data CSV URL
  reportsCsv: "https://docs.google.com/...",         // Reports data CSV URL
  appScriptPostUrl: "https://script.google.com/...", // Apps Script endpoint
  sheetLinks: {
    students: "https://docs.google.com/...",          // Direct link to students sheet
    reports: "https://docs.google.com/..."           // Direct link to reports sheet
  }
}
```

### CSV Data Sources
- **Students CSV**: Contains student information (Coder ID, nickname, full name, etc.)
- **Reports CSV**: Contains progress reports linked to students via Coder ID

## 📱 Usage Examples

### Parent Login
1. Navigate to `/parent`
2. Enter Coder ID (e.g., `6600001`)
3. Enter Parent Password
4. View student profile and past reports

### Coach Access
1. Navigate to `/coach`
2. Enter coach password: `Ciy.club@2025`
3. View all students, add new students, manage reports

### Student Detail View
- Access via `/student/:coderId`
- Shows student profile, all reports in detailed table
- Coaches can add new reports

## 🚢 Deployment

### GitHub Pages
1. Build the project: `npm run build`
2. Deploy `dist/` folder to GitHub Pages
3. Ensure `base: '/ciy-student-reports/'` in `vite.config.ts` matches your repo name

### Manual Deployment
```bash
npm run build
# Upload dist/ folder contents to your web server
```

## 🔧 Development

### Key Technologies
- **Vite**: Fast build tool and dev server
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **React Router**: Hash-based routing (GitHub Pages compatible)

### Styling
- Uses original CSS classes from HTML version (`.glass`, `.badge-*`, etc.)
- Tailwind for utility classes
- Custom CSS for reports table layout and responsive design

### Data Flow
1. CSV files fetched from Google Sheets (public URLs)
2. Data parsed and mapped using flexible header matching
3. State managed via Zustand store
4. New data submitted to Google Apps Script endpoint

## 🐛 Known Issues & TODOs

- **Floating Scrollbar**: Currently commented out, can be enabled if needed
- **Demo Mode**: Apps Script URL contains placeholder - replace with actual deployment URL
- **Error Handling**: Could be enhanced for network failures
- **Caching**: CSV data fetched on every load

## 📄 License

This project is part of CIY.CLUB student management system.

---

**Tech Stack**: React + TypeScript + Vite + Tailwind + Zustand