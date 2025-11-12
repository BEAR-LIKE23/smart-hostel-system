import React, { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import AdminDashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import { Modal } from './components/Modal';
import { Student, Room, Complaint, ModalType, Announcement, MaintenanceRequest } from './types';

const App: React.FC = () => {
    // Gracefully handle missing Supabase configuration
    if (!supabase) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
                <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-lg border-2 border-red-200">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-700">Database Configuration Required</h1>
                        <p className="mt-4 text-gray-600">
                           Welcome! To run this application, you need to connect it to your Supabase database by editing one file.
                        </p>
                    </div>
                    <div className="mt-6 pt-6 border-t text-left text-gray-700">
                        <h2 className="text-lg font-semibold mt-4">How to Fix This:</h2>
                        <p className="mt-2">
                           Please open the file named <code className="font-mono bg-gray-200 px-1 py-0.5 rounded">supabaseClient.ts</code> and replace the placeholder values with your actual Supabase URL and Key.
                        </p>
                        <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-md text-sm">
                           <p className="font-semibold">You need to edit these lines:</p>
                           <pre className="mt-2 text-gray-600"><code>
{`const supabaseUrl = "YOUR_SUPABASE_URL_HERE";
const supabaseKey = "YOUR_SUPABASE_KEY_HERE";`}
                           </code></pre>
                        </div>
                         <p className="mt-4 text-xs text-gray-500">
                            <strong>Important:</strong> You can find these values in your Supabase project's API settings.
                        </p>
                        <p className="mt-3 text-sm">
                           Once you have added your credentials to the file, the application will automatically connect to the database.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [appStatus, setAppStatus] = useState<'loading' | 'ready'>('loading');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
const [isFetchingData, setIsFetchingData] = useState(false);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });


    // Data states
    const [students, setStudents] = useState<Student[]>([]);
    const [currentStudent, setCurrentStudent] = useState<Student | null | undefined>(undefined);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]); // NEW
    const [roommates, setRoommates] = useState<Pick<Student, 'name'>[]>([]);
    
    // UI states
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [isAllocating, setIsAllocating] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);


    // Form states
    const [complaintDescription, setComplaintDescription] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState(4);
    const [newRoomGender, setNewRoomGender] = useState<'Male' | 'Female' | 'Mixed'>('Male');
    const [editedName, setEditedName] = useState('');
    const [editedLevel, setEditedLevel] = useState('');
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    // NEW: Maintenance form states
    const [maintenanceCategory, setMaintenanceCategory] = useState<MaintenanceRequest['category']>('Plumbing');
    const [maintenanceUrgency, setMaintenanceUrgency] = useState<MaintenanceRequest['urgency']>('Medium');
    const [maintenanceDescription, setMaintenanceDescription] = useState('');

    
    // NEW: State for search and filtering
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [complaintSearchTerm, setComplaintSearchTerm] = useState('');
    const [complaintStatusFilter, setComplaintStatusFilter] = useState<'All' | Complaint['status']>('All');
    // NEW: Maintenance filter states
    const [maintenanceSearchTerm, setMaintenanceSearchTerm] = useState('');
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<'All' | MaintenanceRequest['status']>('All');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

useEffect(() => {
    let isMounted = true; // Prevent updates after unmount

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log("🔔 [Auth Event]:", _event, "Session exists:", !!session);
        
        if (_event === 'PASSWORD_RECOVERY') {
            setIsUpdatingPassword(true);
            return;
        }
        
        setSession(session);
        
        if (session) {
            // Don't fetch data if we are in password recovery mode
            if (_event !== 'PASSWORD_RECOVERY') {
                setCurrentStudent(undefined);
                
                // ⚠️ NEW: Only fetch if component is still mounted
                if (isMounted) {
                    await fetchData(session.user);
                }
            }
        } else {
            setUserRole(null);
            setCurrentStudent(null);
        }
        
        // ⚠️ IMPORTANT: Only set ready after everything is done
        if (isMounted) {
            setAppStatus('ready');
        }
    });

    // ⚠️ NEW: Cleanup function
    return () => {
        isMounted = false;
        subscription.unsubscribe();
    };
}, []); // Empty dependency array - only run once

const fetchData = async (user: User) => {
  // Prevent concurrent fetches
  if (isFetchingData) {
    console.log("⏭️ [fetchData] Already fetching, skipping...");
    return;
  }

  setIsFetchingData(true);
  console.log("🚀 [fetchData] Starting data fetch for user:", user);

  try {
    console.log("🔹 Step 1: Fetching user role...");
    
    // ⚠️ REMOVE the getSession check - it's causing the hang
    console.log("📊 [Debug] Supabase client URL:", supabase?.supabaseUrl);
    console.log("📊 [Debug] User ID:", user.id);
    
    // Add timeout wrapper
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 5000) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after ' + timeoutMs + 'ms')), timeoutMs)
      );
      return Promise.race([promise, timeout]);
    };

    console.log("📊 [Debug] Executing query...");
    
    const queryPromise = supabase
      .from("students")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const { data: studentRoleData, error: studentRoleError } = await fetchWithTimeout(queryPromise) as any;
    
    console.log("📊 [Debug] Query completed!");
    console.log("📊 [Debug] Data:", studentRoleData);
    console.log("📊 [Debug] Error:", studentRoleError);

    // Check if student record exists
    if (!studentRoleData) {
      console.error("❌ [Error] No student record found for user:", user.id);
      showNotification("Your account setup is incomplete. Please contact the administrator.");
      setUserRole(null);
      setCurrentStudent(null);
      return;
    }

    if (studentRoleError) {
      console.error("❌ [Error] Database error:", studentRoleError);
      throw studentRoleError;
    }

    const role = studentRoleData?.role;
    console.log("✅ [Role] Retrieved user role:", role);
    setUserRole(role);

    // 🔹 Step 2: Fetch announcements
    console.log("🔹 Step 2: Fetching announcements...");
    const { data: announcementsData, error: announcementsError } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (announcementsError) throw announcementsError;

    console.log("✅ [Announcements] Retrieved:", announcementsData?.length || 0, "records");
    setAnnouncements(announcementsData || []);

    // 🔹 Admin-specific data
    if (role === "admin") {
      console.log("👑 [Admin] Detected admin role. Fetching admin data...");

      // Fetch students
      console.log("➡️ Fetching students...");
const { data: studentsData, error: studentsError } = await supabase
  .from("students")
  .select("*")
  .neq("role", "admin") // exclude admins
  .order("name", { ascending: true });

      if (studentsError) throw studentsError;
      console.log("✅ [Students] Retrieved:", studentsData?.length || 0, "records");

      // Fetch rooms
      console.log("➡️ Fetching rooms...");
      const { data: roomsData, error: roomError } = await supabase
        .from("rooms")
        .select("*, students(count)")
        .order("room_number", { ascending: true });
      if (roomError) throw roomError;
      console.log("✅ [Rooms] Retrieved:", roomsData?.length || 0, "records");

      // Fetch complaints
      console.log("➡️ Fetching complaints...");
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (complaintsError) throw complaintsError;
      console.log("✅ [Complaints] Retrieved:", complaintsData?.length || 0, "records");

      // Fetch maintenance requests
      console.log("➡️ Fetching maintenance requests...");
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (maintenanceError) throw maintenanceError;
      console.log("✅ [Maintenance Requests] Retrieved:", maintenanceData?.length || 0, "records");

      // Update state
      console.log("🧩 [Admin] Updating state with all fetched data...");
      setStudents(studentsData || []);
      setRooms(roomsData || []);
      setComplaints(complaintsData || []);
      setMaintenanceRequests(maintenanceData || []);
      console.log("🎉 [Admin] Data loading complete.");
    }

    // 🔹 Student-specific data
    else {
      console.log("🎓 [Student] Detected student role. Fetching student-specific data...");

      // Fetch student profile
      console.log("➡️ Fetching student profile...");
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*, rooms(*)")
        .eq("id", user.id)
        .single();

      if (studentError || !studentData) {
        console.error("❌ [Error] Student profile not found for user:", user.id, studentError);
        setCurrentStudent(null);
        return;
      }
      console.log("✅ [Student Profile] Loaded:", studentData.name);

      // Fetch complaints
      console.log("➡️ Fetching student complaints...");
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (complaintsError) throw complaintsError;
      console.log("✅ [Complaints] Retrieved:", complaintsData?.length || 0, "records");

      // Fetch maintenance requests
      console.log("➡️ Fetching maintenance requests...");
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (maintenanceError) throw maintenanceError;
      console.log("✅ [Maintenance Requests] Retrieved:", maintenanceData?.length || 0, "records");

      // Fetch roommates
      let roommateData: Pick<Student, "name">[] = [];
      if (studentData.room_id) {
        console.log("➡️ Fetching roommates for room_id:", studentData.room_id);
        const { data, error: roommateError } = await supabase
          .from("students")
          .select("name")
          .eq("room_id", studentData.room_id)
          .neq("id", studentData.id);
        if (roommateError) throw roommateError;
        roommateData = data || [];
        console.log("✅ [Roommates] Found:", roommateData?.length || 0);
      } else {
        console.log("ℹ️ [Roommates] No room assigned for this student.");
      }

      // Update state
      console.log("🧩 [Student] Updating state with fetched data...");
      setComplaints(complaintsData || []);
      setMaintenanceRequests(maintenanceData || []);
      setRoommates(roommateData);
      setCurrentStudent(studentData);

      console.log("🎉 [Student] Data loading complete.");
    }
  } catch (error: any) {
    console.error("🔥 [Error Handler] An error occurred during data fetching:", error);
    console.error("🔥 [Error Details]:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    showNotification(`Failed to load data: ${error.message}`);

    setUserRole(null);
    if (userRole !== "admin") {
      setCurrentStudent(null);
    }
  } finally {
    console.log("🏁 [fetchData] Completing...");
    setIsFetchingData(false);
    setAppStatus('ready');
  }
};


    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserRole(null);
        setStudents([]);
        setRooms([]);
        setComplaints([]);
        setAnnouncements([]);
        setMaintenanceRequests([]);
        setCurrentStudent(null);
        setRoommates([]);
        setIsUpdatingPassword(false);
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAllocateRooms = async () => {
        setIsAllocating(true);
        showNotification("Allocating rooms... this may take a moment.");

        try {
const { data: unassignedStudents, error: studentError } = await supabase
  .from("students")
  .select("id, gender")
  .is("room_id", null)
  .neq("role", "admin"); // exclude admins from room allocation


            const { data: allRooms, error: roomError } = await supabase
                .from('rooms')
                .select('id, capacity, gender_type, students(count)');

            if (studentError || roomError || !unassignedStudents || !allRooms) {
                throw new Error("Error fetching data for allocation.");
            }

            const roomAvailability = new Map(allRooms.map(r => [r.id, r.capacity - (r.students[0]?.count || 0)]));
            const studentUpdates = [];

            for (const student of unassignedStudents) {
                const availableRoom = allRooms.find(r => 
                    r.gender_type === student.gender && ((roomAvailability.get(r.id) as number || 0) > 0)
                );

                if (availableRoom) {
                    studentUpdates.push({ id: student.id, room_id: availableRoom.id });
                    roomAvailability.set(availableRoom.id, (roomAvailability.get(availableRoom.id) as number) - 1);
                }
            }
            
       if (studentUpdates.length > 0) {
    const { error: updateError } = await supabase
        .from('students')
        .update(studentUpdates.map(s => ({ room_id: s.room_id })))
        .in('id', studentUpdates.map(s => s.id));

    if (updateError) throw updateError;
}


            showNotification(`Allocation complete. ${studentUpdates.length} students assigned to rooms.`);
            if (session) await fetchData(session.user);

        } catch (err: any) {
            showNotification(`Allocation failed: ${err.message}`);
            console.log(err);
        } finally {
            setIsAllocating(false);
        }
    };

    const handleComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaintDescription.trim()) {
            setFormError("Description cannot be empty.");
            return;
        }
        if (!currentStudent || !currentStudent.rooms) {
            setFormError("Cannot submit complaint without an assigned room.");
            return;
        }

        const { error } = await supabase.from('complaints').insert({
            student_id: currentStudent.id,
            student_name: currentStudent.name,
            room_number: currentStudent.rooms.room_number,
            description: complaintDescription,
            status: 'Pending'
        });

        if (error) {
            showNotification(`Error: ${error.message}`);
        } else {
            showNotification("Complaint submitted successfully!");
            closeModal();
            if(session) await fetchData(session.user);
        }
    };
    
    const updateComplaintStatus = async (id: number, status: Complaint['status']) => {
        const { error } = await supabase.from('complaints').update({ status }).eq('id', id);
        if(error) {
            showNotification(`Error: ${error.message}`);
        } else {
            showNotification(`Complaint status updated to "${status}".`);
            setComplaints(complaints.map(c => c.id === id ? {...c, status} : c));
        }
    };

    // NEW: Handle maintenance request submission
    const handleMaintenanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!maintenanceDescription.trim()) {
            setFormError("Description cannot be empty.");
            return;
        }
        if (!currentStudent || !currentStudent.rooms) {
            setFormError("Cannot submit a request without an assigned room.");
            return;
        }

        const { error } = await supabase.from('maintenance_requests').insert({
            student_id: currentStudent.id,
            student_name: currentStudent.name,
            room_number: currentStudent.rooms.room_number,
            category: maintenanceCategory,
            urgency: maintenanceUrgency,
            description: maintenanceDescription,
            status: 'Pending'
        });

        if (error) {
            showNotification(`Error: ${error.message}`);
        } else {
            showNotification("Maintenance request submitted successfully!");
            closeModal();
            if(session) await fetchData(session.user);
        }
    };

    // NEW: Update maintenance request status
    const updateMaintenanceStatus = async (id: number, status: MaintenanceRequest['status']) => {
        const { error } = await supabase.from('maintenance_requests').update({ status }).eq('id', id);
        if(error) {
            showNotification(`Error: ${error.message}`);
        } else {
            showNotification(`Request status updated to "${status}".`);
            setMaintenanceRequests(maintenanceRequests.map(r => r.id === id ? {...r, status} : r));
        }
    };

    const handleOpenAssignModal = (student: Student) => {
        setStudentToAssign(student);
        openModal('assignRoom');
    };

    const handleOpenStudentProfile = (student: Student) => {
        setSelectedStudent(student);
        openModal('studentProfile');
    };
    
    const handleUnassignRoom = async (studentId: string) => {
        if (!window.confirm("Are you sure you want to unassign this student from their room?")) return;
        
        const { error } = await supabase.from('students').update({ room_id: null }).eq('id', studentId);
        if (error) {
            showNotification(`Error: ${error.message}`);
        } else {
            showNotification("Student unassigned successfully.");
            if (session) await fetchData(session.user);
        }
    };

    const handleConfirmAssignment = async () => {
        if (!studentToAssign || !selectedRoomId) {
            showNotification("No student or room selected.");
            return;
        }
        console.log(studentToAssign, selectedRoomId);
const { data, error } = await supabase
  .from('students')
  .update({ room_id: selectedRoomId })
  .eq('id', studentToAssign.id)
  .select('*');
        if (error) {
            showNotification(`Error assigning room: ${error.message}`);
        } else {
            showNotification(`${studentToAssign.name} assigned successfully.`);
            closeModal();
            if (session) await fetchData(session.user);
        }
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!newRoomNumber.trim()) {
            setFormError("Room number cannot be empty.");
            return;
        }

        const { error } = await supabase.from('rooms').insert({
            room_number: newRoomNumber,
            capacity: newRoomCapacity,
            gender_type: newRoomGender
        });

        if (error) {
            showNotification(`Error: ${error.message}`);
            if (error.message.includes('duplicate key')) {
                setFormError(`Room number "${newRoomNumber}" already exists.`);
            }
        } else {
            showNotification(`Room ${newRoomNumber} created successfully!`);
            closeModal();
            if(session) await fetchData(session.user);
        }
    };

    const handleOpenEditProfile = () => {
        if (currentStudent) {
            setEditedName(currentStudent.name);
            setEditedLevel(currentStudent.level);
            openModal('editProfile');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!editedName.trim() || !editedLevel.trim()) {
            setFormError("Name and Level cannot be empty.");
            return;
        }
        if (!currentStudent) return;

        const { error } = await supabase
            .from('students')
            .update({ name: editedName, level: editedLevel })
            .eq('id', currentStudent.id);

        if (error) {
            showNotification(`Error updating profile: ${error.message}`);
            setFormError(error.message);
        } else {
            showNotification("Profile updated successfully!");
            setCurrentStudent({ ...currentStudent, name: editedName, level: editedLevel });
            closeModal();
        }
    };

    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!announcementTitle.trim() || !announcementContent.trim()) {
            setFormError("Title and content cannot be empty.");
            return;
        }

        const { error } = await supabase.from('announcements').insert({
            title: announcementTitle,
            content: announcementContent,
        });

        if (error) {
            showNotification(`Error posting announcement: ${error.message}`);
            setFormError(error.message);
        } else {
            showNotification("Announcement posted successfully!");
            closeModal();
            if (session) await fetchData(session.user);
        }
    };

 const handleGenerateAnnouncement = async () => {
    if (!aiPrompt.trim()) {
        setFormError("Please enter a topic for the announcement.");
        return;
    }
    setIsGenerating(true);
    setFormError(null);
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyDANyz6Uox_MLGrBEHRLRfO7t2F4P9WUx8");
        // console.log("API key:",supabase.apiKey);
        // console.log(genAI.());
        const model = genAI.getGenerativeModel({ 
    model: "models/gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: {
                            type: SchemaType.STRING,
                            description: "A concise and informative title for the announcement."
                        },
                        content: {
                            type:SchemaType.STRING,
                            description: "The full content of the announcement, well-formatted and easy to read."
                        }
                    },
                    required: ["title", "content"]
                }
            }
        });

        const result = await model.generateContent(
            `Based on the following points, write a clear and professional announcement for a student hostel. The tone should be informative but friendly. \n\nPoints: "${aiPrompt}"`
        );
        
        const response = await result.response;
        const text = response.text();
        const parsedResult = JSON.parse(text);
        
        setAnnouncementTitle(parsedResult.title);
        setAnnouncementContent(parsedResult.content);
    } catch (error) {
        console.error("Error generating announcement:", error);
        showNotification("Failed to generate announcement. Please try again.");
        setFormError("AI generation failed. Please check the console for details.");
    } finally {
        setIsGenerating(false);
    }
};
    const exportToCsv = (data: any[], filename: string) => {
        if (data.length === 0) {
            showNotification("No data to export.");
            return;
        }
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(fieldName => 
                    JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value)
                ).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`${filename}.csv has been downloaded.`);
    };

    const handleExportStudents = () => {
        const dataToExport = students.map(s => ({
            name: s.name,
            email: s.email,
            level: s.level,
            gender: s.gender,
            room_number: rooms.find(r => r.id === s.room_id)?.room_number || 'Unassigned',
        }));
        exportToCsv(dataToExport, 'student_report');
    };

    const handleExportRooms = () => {
        const dataToExport = rooms.map(r => ({
            room_number: r.room_number,
            gender_type: r.gender_type,
            capacity: r.capacity,
            occupants: r.students?.[0]?.count || 0,
        }));
        exportToCsv(dataToExport, 'room_occupancy_report');
    };


    const openModal = (type: ModalType) => setActiveModal(type);
    const closeModal = () => {
        setActiveModal(null);
        setComplaintDescription('');
        setFormError(null);
        setStudentToAssign(null);
        setSelectedRoomId(null);
        setSelectedStudent(null);
        setNewRoomNumber('');
        setNewRoomCapacity(4);
        setNewRoomGender('Male');
        setEditedName('');
        setEditedLevel('');
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setAiPrompt('');
        // NEW: Reset search/filter states
        setStudentSearchTerm('');
        setComplaintSearchTerm('');
        setComplaintStatusFilter('All');
        setMaintenanceDescription('');
        setMaintenanceCategory('Plumbing');
        setMaintenanceUrgency('Medium');
        setMaintenanceSearchTerm('');
        setMaintenanceStatusFilter('All');
    };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'view':
                const filteredStudents = students.filter(student =>
                    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
                );
                return (
                    <div>
                        <div className="flex gap-2 mb-4">
                           <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={studentSearchTerm}
                                onChange={e => setStudentSearchTerm(e.target.value)}
                            />
                            <button onClick={handleExportStudents} className="flex-shrink-0 px-4 py-2 rounded-md font-semibold transition-all duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Export</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Room</th>
                                        <th scope="col" className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 && (
                                        <tr><td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">No students found.</td></tr>
                                    )}
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                                            <td className="px-4 py-3">{rooms.find(r => r.id === student.room_id)?.room_number || 'Unassigned'}</td>
                                            <td className="px-4 py-3 space-x-2">
                                                {student.room_id ? (
                                                    <button onClick={() => handleUnassignRoom(student.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Unassign</button>
                                                ) : (
                                                    <button onClick={() => handleOpenAssignModal(student)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Assign</button>
                                                )}
                                                <button onClick={() => handleOpenStudentProfile(student)} className="font-medium text-gray-600 dark:text-gray-400 hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'viewComplaints':
                let complaintsToShow = userRole === 'admin' ? complaints : complaints.filter(c => c.student_id === session?.user.id);
                 if (userRole === 'admin') {
                    if (complaintStatusFilter !== 'All') {
                        complaintsToShow = complaintsToShow.filter(c => c.status === complaintStatusFilter);
                    }
                    if (complaintSearchTerm) {
                        const lowerCaseSearch = complaintSearchTerm.toLowerCase();
                        complaintsToShow = complaintsToShow.filter(c =>
                            c.student_name.toLowerCase().includes(lowerCaseSearch) ||
                            c.room_number.toLowerCase().includes(lowerCaseSearch) ||
                            c.description.toLowerCase().includes(lowerCaseSearch)
                        );
                    }
                }
                
                const filterButtonClasses = (status: typeof complaintStatusFilter) => 
                  `px-3 py-1 text-sm font-medium rounded-full transition-colors ${complaintStatusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`;

                return (
                    <div>
                        {userRole === 'admin' && (
                            <div className="mb-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Search by name, room, or keyword..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={complaintSearchTerm}
                                    onChange={e => setComplaintSearchTerm(e.target.value)}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setComplaintStatusFilter('All')} className={filterButtonClasses('All')}>All</button>
                                    <button onClick={() => setComplaintStatusFilter('Pending')} className={filterButtonClasses('Pending')}>Pending</button>
                                    <button onClick={() => setComplaintStatusFilter('In Progress')} className={filterButtonClasses('In Progress')}>In Progress</button>
                                    <button onClick={() => setComplaintStatusFilter('Resolved')} className={filterButtonClasses('Resolved')}>Resolved</button>
                                </div>
                            </div>
                        )}
                        <div className="max-h-96 overflow-y-auto space-y-4">
                            {complaintsToShow.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No complaints found.</p>}
                            {complaintsToShow.map(complaint => (
                                <div key={complaint.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{complaint.student_name} (Room {complaint.room_number})</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(complaint.created_at).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{complaint.status}</span>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">{complaint.description}</p>
                                    {userRole === 'admin' && (
                                        <div className="mt-3 flex items-center justify-between">
                                             <button onClick={() => handleOpenStudentProfile(students.find(s => s.id === complaint.student_id)!)} className="text-xs font-medium text-blue-600 dark:text-blue-500 hover:underline">View Student Profile</button>
                                            <select
                                                onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as Complaint['status'])}
                                                value={complaint.status}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'submitComplaint':
                return (
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Complaint Description</label>
                            <textarea
                                id="description"
                                value={complaintDescription}
                                onChange={(e) => setComplaintDescription(e.target.value)}
                                rows={4}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Please describe your issue in detail..."
                                required
                            />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                            Submit Complaint
                        </button>
                    </form>
                );
            
            // NEW: Maintenance request submission form
            case 'submitMaintenance':
                return (
                     <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                        <div>
                             <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Category</label>
                            <select id="category" value={maintenanceCategory} onChange={e => setMaintenanceCategory(e.target.value as any)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                <option>Plumbing</option>
                                <option>Electrical</option>
                                <option>Furniture</option>
                                <option>Other</option>
                            </select>
                        </div>
                         <div>
                             <label htmlFor="urgency" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Urgency</label>
                            <select id="urgency" value={maintenanceUrgency} onChange={e => setMaintenanceUrgency(e.target.value as any)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="maintenance-description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description of Issue</label>
                            <textarea
                                id="maintenance-description"
                                value={maintenanceDescription}
                                onChange={(e) => setMaintenanceDescription(e.target.value)}
                                rows={4}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Please describe the problem..."
                                required
                            />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
                            Submit Request
                        </button>
                    </form>
                );

            // NEW: Admin view for maintenance requests
            case 'viewMaintenance':
                 let requestsToShow = maintenanceRequests;
                 if (maintenanceStatusFilter !== 'All') {
                    requestsToShow = requestsToShow.filter(r => r.status === maintenanceStatusFilter);
                 }
                 if (maintenanceSearchTerm) {
                    const lowerCaseSearch = maintenanceSearchTerm.toLowerCase();
                    requestsToShow = requestsToShow.filter(r =>
                        r.student_name.toLowerCase().includes(lowerCaseSearch) ||
                        r.room_number.toLowerCase().includes(lowerCaseSearch) ||
                        r.description.toLowerCase().includes(lowerCaseSearch) ||
                        r.category.toLowerCase().includes(lowerCaseSearch)
                    );
                 }

                const maintenanceFilterClasses = (status: typeof maintenanceStatusFilter) => 
                  `px-3 py-1 text-sm font-medium rounded-full transition-colors ${maintenanceStatusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`;
                
                const urgencyClasses = {
                    'High': 'border-red-500 text-red-600 dark:text-red-400',
                    'Medium': 'border-yellow-500 text-yellow-600 dark:text-yellow-400',
                    'Low': 'border-green-500 text-green-600 dark:text-green-400',
                };
                
                return (
                    <div>
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Search requests..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={maintenanceSearchTerm}
                                onChange={e => setMaintenanceSearchTerm(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setMaintenanceStatusFilter('All')} className={maintenanceFilterClasses('All')}>All</button>
                                <button onClick={() => setMaintenanceStatusFilter('Pending')} className={maintenanceFilterClasses('Pending')}>Pending</button>
                                <button onClick={() => setMaintenanceStatusFilter('In Progress')} className={maintenanceFilterClasses('In Progress')}>In Progress</button>
                                <button onClick={() => setMaintenanceStatusFilter('Completed')} className={maintenanceFilterClasses('Completed')}>Completed</button>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-4">
                            {requestsToShow.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No maintenance requests found.</p>}
                            {requestsToShow.map(req => (
                                <div key={req.id} className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${urgencyClasses[req.urgency]}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{req.student_name} (Room {req.room_number})</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(req.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">{req.category}</span>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{req.status}</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">{req.description}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <button onClick={() => handleOpenStudentProfile(students.find(s => s.id === req.student_id)!)} className="text-xs font-medium text-blue-600 dark:text-blue-500 hover:underline">View Student Profile</button>
                                        <select
                                            onChange={(e) => updateMaintenanceStatus(req.id, e.target.value as MaintenanceRequest['status'])}
                                            value={req.status}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );


            case 'roomOccupancy':
                return (
                    <div>
                        <button onClick={handleExportRooms} className="mb-4 w-full flex items-center justify-center p-2 rounded-md font-semibold transition-all duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Export to CSV</button>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Room #</th>
                                        <th scope="col" className="px-4 py-3">Gender</th>
                                        <th scope="col" className="px-4 py-3">Occupancy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rooms.map(room => {
                                        const occupants = room.students?.[0]?.count || 0;
                                        return (
                                            <tr key={room.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{room.room_number}</td>
                                                <td className="px-4 py-3">{room.gender_type}</td>
                                                <td className="px-4 py-3">{occupants} / {room.capacity}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'assignRoom':
                const availableRooms = rooms.filter(r =>
                    (r.gender_type === studentToAssign?.gender || r.gender_type === 'Mixed') &&
                    (r.students?.[0]?.count || 0) < r.capacity
                );
                return (
                    <div className="space-y-4">
                        <p className="dark:text-gray-300">Select a room for <strong>{studentToAssign?.name}</strong> ({studentToAssign?.gender}):</p>
                        <div>
                            <select
                                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                                defaultValue=""
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            >
                                <option value="" disabled>Select a room</option>
                                {availableRooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        Room {room.room_number} ({room.students?.[0]?.count || 0} / {room.capacity})
                                    </option>
                                ))}
                            </select>
                        </div>
                         {availableRooms.length === 0 && <p className="text-sm text-center text-red-500">No available rooms for this student's gender.</p>}
                        <button onClick={handleConfirmAssignment} disabled={!selectedRoomId} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 dark:disabled:bg-gray-600">
                            Confirm Assignment
                        </button>
                    </div>
                );

            case 'viewRoommates':
                return (
                    <div>
                        {roommates.length > 0 ? (
                            <ul className="space-y-2">
                                {roommates.map((mate, index) => <li key={index} className="p-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md">{mate.name}</li>)}
                            </ul>
                        ) : <p className="text-center text-gray-500 dark:text-gray-400">You are the only one in this room currently.</p>}
                    </div>
                );

            case 'addRoom':
                return (
                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <div>
                            <label htmlFor="room-number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Room Number</label>
                            <input type="text" id="room-number" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Capacity</label>
                            <input type="number" id="capacity" value={newRoomCapacity} onChange={e => setNewRoomCapacity(Number(e.target.value))} min="1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Gender Type</label>
                            <select id="gender" value={newRoomGender} onChange={e => setNewRoomGender(e.target.value as any)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">Add Room</button>
                    </form>
                );

            case 'studentProfile':
                if (!selectedStudent) return <p>No student selected.</p>;
                const studentComplaints = complaints.filter(c => c.student_id === selectedStudent.id);
                return (
                     <div className="space-y-4 text-sm">
                        <div className="space-y-1 p-3 bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded-md">
                            <p><strong>Name:</strong> {selectedStudent.name}</p>
                            <p><strong>Email:</strong> {selectedStudent.email}</p>
                            <p><strong>Level:</strong> {selectedStudent.level}</p>
                            <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                            <p><strong>Room:</strong> {rooms.find(r => r.id === selectedStudent.room_id)?.room_number || 'Unassigned'}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2 dark:text-gray-200">Complaint History ({studentComplaints.length})</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                            {studentComplaints.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No complaints filed.</p> :
                                studentComplaints.map(c => (
                                    <div key={c.id} className="p-2 border dark:border-gray-600 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.created_at).toLocaleDateString()}</p>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : c.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>{c.status}</span>
                                        </div>
                                        <p className="mt-1 dark:text-gray-300">{c.description}</p>
                                    </div>
                                ))
                            }
                            </div>
                         </div>
                    </div>
                );

            case 'editProfile':
                return (
                     <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Full Name</label>
                            <input type="text" id="edit-name" value={editedName} onChange={e => setEditedName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="edit-level" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Level</label>
                            <input type="text" id="edit-level" value={editedLevel} onChange={e => setEditedLevel(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">Update Profile</button>
                    </form>
                );
            case 'postAnnouncement':
                 return (
                     <form onSubmit={handlePostAnnouncement} className="space-y-4">
                        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-gray-700 dark:border-blue-900">
                           <label htmlFor="ai-prompt" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">✨ AI Assistant</label>
                           <div className="flex gap-2">
                             <input 
                                type="text" 
                                id="ai-prompt" 
                                value={aiPrompt} 
                                onChange={e => setAiPrompt(e.target.value)} 
                                placeholder="e.g., water off saturday 10am-2pm"
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                             />
                             <button type="button" onClick={handleGenerateAnnouncement} disabled={isGenerating} className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-800">
                                {isGenerating ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Generate"}
                             </button>
                           </div>
                        </div>

                        <div>
                            <label htmlFor="ann-title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
                            <input type="text" id="ann-title" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="ann-content" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Content</label>
                            <textarea id="ann-content" value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} rows={5} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800">Post Announcement</button>
                    </form>
                );
                
            case 'viewAnnouncements':
                return (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                        {announcements.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No announcements yet.</p>}
                        {announcements.map(ann => (
                            <div key={ann.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{ann.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(ann.created_at).toLocaleString()}</p>
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                );
                
            default:
                return null;
        }
    };
    
    const getModalTitle = (): string => {
        switch (activeModal) {
            case 'view':
                return 'Student Management';
            case 'viewComplaints':
                return userRole === 'admin' ? 'Manage Complaints' : 'My Complaints';
            case 'submitComplaint':
                return 'Submit a New Complaint';
            case 'roomOccupancy':
                return 'Room Occupancy Overview';
            case 'assignRoom':
                return `Assign Room to ${studentToAssign?.name || 'Student'}`;
            case 'viewRoommates':
                return `Roommates in Room ${currentStudent?.rooms?.room_number || ''}`;
            case 'addRoom':
                return 'Add a New Room';
            case 'studentProfile':
                return `Student Profile: ${selectedStudent?.name || ''}`;
            case 'editProfile':
                return 'Edit Your Profile';
            case 'postAnnouncement':
                return 'Post a New Announcement';
            case 'viewAnnouncements':
                return 'Hostel Announcements';
            case 'submitMaintenance':
                return 'Submit Maintenance Request';
            case 'viewMaintenance':
                return 'Manage Maintenance Requests';
            default:
                return '';
        }
    };

    // Calculate statistics for the admin dashboard
    const assignedStudentsCount = students.filter(s => s.room_id !== null).length;
    const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((assignedStudentsCount / totalCapacity) * 100) : 0;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    const pendingMaintenanceCount = maintenanceRequests.filter(r => r.status !== 'Completed').length; // NEW
    
    if (appStatus === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Loading application...
                </p>
            </div>
        );
    }

    if (isUpdatingPassword) {
        return <UpdatePasswordForm onPasswordUpdated={() => {
            showNotification("Password updated successfully. Please sign in again.");
            handleLogout();
        }} />;
    }

    return (
        <div className="font-sans">
            {!session ? <Login /> : (
                userRole === 'admin' ? 
                <AdminDashboard 
                    username={session.user.email || 'Admin'}
                    onLogout={handleLogout}
                    onViewStudents={() => openModal('view')}
                    onViewComplaints={() => openModal('viewComplaints')}
                    onAllocate={handleAllocateRooms}
                    onRoomOccupancy={() => openModal('roomOccupancy')}
                    onAddRoom={() => openModal('addRoom')}
                    onPostAnnouncement={() => openModal('postAnnouncement')}
                    onViewMaintenance={() => openModal('viewMaintenance')}
                    isAllocating={isAllocating}
                    totalStudents={students.length}
                    assignedStudents={assignedStudentsCount}
                    occupancyPercentage={occupancyPercentage}
                    pendingComplaints={pendingComplaintsCount}
                    pendingMaintenance={pendingMaintenanceCount}
                    theme={theme}
                    toggleTheme={toggleTheme}
                /> :
                <StudentDashboard
                    student={currentStudent}
                    complaints={complaints}
                    onLogout={handleLogout}
                    onSubmitComplaint={() => openModal('submitComplaint')}
                    onViewComplaints={() => openModal('viewComplaints')}
                    onViewRoommates={() => openModal('viewRoommates')}
                    onViewAnnouncements={() => openModal('viewAnnouncements')}
                    onEditProfile={handleOpenEditProfile}
                    onSubmitMaintenance={() => openModal('submitMaintenance')}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            )}

            <Modal 
                isOpen={activeModal !== null} 
                onClose={closeModal} 
                title={getModalTitle()}
            >
                {renderModalContent()}
            </Modal>

            {notification && (
                 <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up z-50 dark:bg-gray-700 dark:text-gray-200">
                    {notification}
                </div>
            )}
            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

const UpdatePasswordForm: React.FC<{ onPasswordUpdated: () => void }> = ({ onPasswordUpdated }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            onPasswordUpdated();
        } catch (err: any) {
            setError(err.error_description || err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Update Your Password</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Enter a new password for your account.</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handlePasswordUpdate}>
                    <input 
                        name="password" 
                        type="password"
                        required 
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        placeholder="New Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:bg-amber-300 dark:disabled:bg-amber-800">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default App;