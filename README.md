# 🏠 HostelHub - Student Hostel Management System

A comprehensive web-based hostel management system built with React, TypeScript, and Supabase. HostelHub streamlines room allocations, complaint management, maintenance requests, and communication between administrators and students.

## ✨ Features

### 👨‍💼 Admin Features
- **Student Management**
  - View all registered students
  - Search students by name or email
  - Assign/unassign students to rooms
  - View detailed student profiles with complaint history
  - Export student data to CSV

- **Room Management**
  - Auto-allocate rooms based on gender and capacity
  - Add new rooms with custom capacity
  - View real-time room occupancy
  - Export room occupancy reports

- **Complaint Management**
  - View all student complaints
  - Filter complaints by status (Pending, In Progress, Resolved)
  - Search complaints by keywords
  - Update complaint status
  - Track complaint history per student

- **Maintenance Requests**
  - Manage all maintenance requests
  - Filter by status and urgency
  - Categorize by type (Plumbing, Electrical, Furniture, Other)
  - Update request status

- **Announcements**
  - Post hostel-wide announcements
  - AI-powered announcement generation (powered by Google Gemini)
  - View announcement history

### 🎓 Student Features
- **Personal Dashboard**
  - View assigned room information
  - Check roommate details
  - View personal statistics

- **Complaint System**
  - Submit complaints with detailed descriptions
  - Track complaint status
  - View complaint history

- **Maintenance Requests**
  - Submit maintenance requests by category
  - Set urgency level (Low, Medium, High)
  - Track request status

- **Profile Management**
  - Edit personal information
  - Update academic level

- **Communication**
  - View hostel announcements in real-time

### 🎨 UI/UX Features
- **Dark Mode Support** - Toggle between light and dark themes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Instant data synchronization with Supabase
- **Search & Filter** - Powerful search and filtering capabilities
- **Export Functionality** - Download reports as CSV files
- **Landing Page** - Beautiful homepage for first-time visitors

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI Integration:** Google Generative AI (Gemini)
- **Build Tool:** Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/BEAR-LIKE23/smart-hostel-system.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Create the following tables in your Supabase database:

#### Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  level TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  room_id INTEGER REFERENCES rooms(id),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Rooms Table
```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL,
  gender_type TEXT NOT NULL CHECK (gender_type IN ('Male', 'Female', 'Mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Complaints Table
```sql
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  student_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Maintenance Requests Table
```sql
CREATE TABLE maintenance_requests (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  student_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Plumbing', 'Electrical', 'Furniture', 'Other')),
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Announcements Table
```sql
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Configure Environment Variables

Open `src/supabaseClient.ts` and replace the placeholder values:

```typescript
const supabaseUrl = "YOUR_SUPABASE_URL_HERE";
const supabaseKey = "YOUR_SUPABASE_KEY_HERE";
```

You can find these values in your Supabase project settings under **API**.

### 5. Configure Google Gemini AI (Optional)

If you want to use the AI announcement generation feature, replace the API key in `src/App.tsx`:

```typescript
const genAI = new GoogleGenerativeAI("YOUR_GOOGLE_AI_API_KEY");
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 👥 User Roles

### Creating Admin Users
To create an admin user, after registration, manually update the `role` field in the `students` table:

```sql
UPDATE students 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 🔐 Security Features

- Supabase Row Level Security (RLS) policies
- Secure authentication with email/password
- Password recovery functionality
- Role-based access control
- Protected API routes

## 📦 Project Structure

```
smart-hostel-system/
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── Modal.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── supabaseClient.ts
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend and Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Google Gemini AI](https://ai.google.dev/) - AI-powered features
- [React](https://react.dev) - Frontend framework

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
