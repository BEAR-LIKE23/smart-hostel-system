import React, { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { supabase, googleApiKey } from './supabaseClient';
import Login from './components/Login';
import HomePage from './components/Homepage';
import AdminDashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import { Modal } from './components/Modal';
import CustomReceipt from './components/CustomReceipt';
import { Student, Room, Complaint, ModalType, Announcement, MaintenanceRequest, GatePass, PaymentRecord, HostelNotification } from './types';

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
    const [viewingLandingPage, setViewingLandingPage] = useState(true);
    const [loginInitialView, setLoginInitialView] = useState<'signin' | 'signup'>('signin');
    const [connectionError, setConnectionError] = useState<string | null>(null);

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
    const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [notifications, setNotifications] = useState<HostelNotification[]>([]);
    
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
    
    // NEW: Gate pass form states
    const [gatePassDeparture, setGatePassDeparture] = useState('');
    const [gatePassReturn, setGatePassReturn] = useState('');
    const [gatePassReason, setGatePassReason] = useState('');
    const [gatePassDestination, setGatePassDestination] = useState('');
    const [gatePassParentContact, setGatePassParentContact] = useState('');
    
    // NEW: State for search and filtering
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [complaintSearchTerm, setComplaintSearchTerm] = useState('');
    const [complaintStatusFilter, setComplaintStatusFilter] = useState<'All' | Complaint['status']>('All');
    // NEW: Maintenance filter states
    const [maintenanceSearchTerm, setMaintenanceSearchTerm] = useState('');
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<'All' | MaintenanceRequest['status']>('All');
    // NEW: Gate pass filter states
    const [gatePassSearchTerm, setGatePassSearchTerm] = useState('');
    const [gatePassStatusFilter, setGatePassStatusFilter] = useState<'All' | GatePass['status']>('All');
    // NEW: Payment filter states
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | PaymentRecord['status']>('All');
    const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<PaymentRecord | null>(null);

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
    let isFetchingLock = false; // NEW: Proper lock to prevent rapid concurrent fetches

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log("🔔 [Auth Event]:", _event, "Session exists:", !!session);
        
        if (isFetchingLock) {
            console.log("⏭️ [Auth Event] Already fetching, skipping this rapid event...");
            return;
        }
        
        if ((_event as string) === 'PASSWORD_RECOVERY') {
            setIsUpdatingPassword(true);
            return;
        }
        
        setSession(session);
        
        if (session) {
            setViewingLandingPage(false);

            // ⚠️ Avoid refetching data and showing loaders on silent background events like token refreshes
            if ((_event as string) === 'TOKEN_REFRESHED' || (_event as string) === 'USER_UPDATED') {
                return;
            }

            // Don't fetch data if we are in password recovery mode
            if ((_event as string) !== 'PASSWORD_RECOVERY') {
                setCurrentStudent(undefined);
                
                if (isMounted) {
                    isFetchingLock = true;
                    await fetchData(session.user);
                    isFetchingLock = false;
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
  setIsFetchingData(true);
  setConnectionError(null);
  console.log("🚀 [fetchData] Starting data fetch for user:", user);

  try {
    console.log("🔹 Step 1: Fetching user role...");
    
    // ⚠️ REMOVE the getSession check - it's causing the hang
    console.log("📊 [Debug] Supabase client URL:", (supabase as any)?.supabaseUrl);
    console.log("📊 [Debug] User ID:", user.id);
    console.log("📊 [Debug] Executing query...");
    
    // Safety timeout of 10 seconds
    const fetchWithTimeout = (promise: Promise<any>) => {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout (please check if your Supabase database is paused or sleeping)')), 10000));
      return Promise.race([promise, timeout]);
    };

    const queryPromise = supabase
      .from("students")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const { data: studentRoleData, error: studentRoleError } = await fetchWithTimeout(queryPromise as any) as any;
    
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

      // Fetch admin data concurrently
      console.log("➡️ Fetching admin data in parallel...");
      const [studentsRes, roomsRes, complaintsRes, maintenanceRes] = await Promise.all([
        supabase.from("students").select("*").neq("role", "admin").order("name", { ascending: true }),
        supabase.from("rooms").select("*, students(count)").order("room_number", { ascending: true }),
        supabase.from("complaints").select("*").order("created_at", { ascending: false }),
        supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false })
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (roomsRes.error) throw roomsRes.error;
      if (complaintsRes.error) throw complaintsRes.error;
      if (maintenanceRes.error) throw maintenanceRes.error;

      // Update state
      console.log("🧩 [Admin] Updating state with all fetched data...");
      setStudents(studentsRes.data || []);
      setRooms(roomsRes.data || []);
      setComplaints(complaintsRes.data || []);
      setMaintenanceRequests(maintenanceRes.data || []);

      // Load Gate Passes for admin
      try {
        const { data: gpData, error: gpErr } = await supabase.from('gate_passes').select('*').order('created_at', { ascending: false });
        if (!gpErr && gpData && gpData.length > 0) {
          setGatePasses(gpData);
        } else {
          const saved = localStorage.getItem('hostelhub_gate_passes');
          if (saved) {
            setGatePasses(JSON.parse(saved));
          } else {
            const initialPasses: GatePass[] = (studentsRes.data || []).slice(0, 3).map((st: any, idx: number) => ({
              id: idx + 1,
              created_at: new Date(Date.now() - (idx + 1) * 3600000 * 24).toISOString(),
              student_id: st.id,
              student_name: st.name,
              room_number: roomsRes.data?.find((r: any) => r.id === st.room_id)?.room_number || '101',
              departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              return_date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
              reason: idx === 0 ? 'Medical appointment with family physician' : 'Weekend family leave',
              destination: idx === 0 ? 'City Medical Center' : 'Home Residence',
              parent_contact: '+1 (555) 234-5678',
              status: idx === 0 ? 'Pending' : (idx === 1 ? 'Approved' : 'Rejected'),
              approved_by: idx === 1 ? 'Warden Office' : undefined,
              approved_at: idx === 1 ? new Date().toISOString() : undefined
            }));
            setGatePasses(initialPasses);
            localStorage.setItem('hostelhub_gate_passes', JSON.stringify(initialPasses));
          }
        }
      } catch (e) {
        console.warn('Gate passes table not configured yet in Supabase, using state fallback');
      }

      // Load Payments for admin
      try {
        const { data: payData, error: payErr } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (!payErr && payData && payData.length > 0) {
          setPaymentRecords(payData);
        } else {
          const savedPay = localStorage.getItem('hostelhub_payments');
          if (savedPay) {
            setPaymentRecords(JSON.parse(savedPay));
          } else {
            const initialPayments: PaymentRecord[] = (studentsRes.data || []).map((st: any, idx: number) => ({
              id: idx + 1,
              created_at: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
              student_id: st.id,
              student_name: st.name,
              room_number: roomsRes.data?.find((r: any) => r.id === st.room_id)?.room_number || 'Unassigned',
              academic_year: '2025/2026',
              semester: 'Full Session',
              amount: 1200,
              status: idx % 4 === 0 ? 'Pending' : 'Paid',
              payment_date: idx % 4 === 0 ? undefined : new Date(Date.now() - (idx + 2) * 86400000).toISOString().split('T')[0],
              receipt_number: `HH-REC-2026-${1000 + idx}`,
              payment_method: 'Online'
            }));
            setPaymentRecords(initialPayments);
            localStorage.setItem('hostelhub_payments', JSON.stringify(initialPayments));
          }
        }
      } catch (e) {
        console.warn('Payments table not configured yet in Supabase, using state fallback');
      }

      // Generate admin notifications
      const adminNotes: HostelNotification[] = [
        {
          id: 'note-admin-1',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          title: 'New Maintenance Ticket',
          message: 'Room 204 reported a plumbing leak requiring review.',
          type: 'maintenance',
          read: false
        },
        {
          id: 'note-admin-2',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          title: 'Pending Gate Pass Request',
          message: 'A student requested a weekend out-pass requiring warden approval.',
          type: 'gatepass',
          read: false
        }
      ];
      setNotifications(adminNotes);

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

      // Fetch complaints, maintenance, and roommates concurrently!
      console.log("➡️ Fetching auxiliary student data in parallel...");
      
      const roommatesPromise = studentData.room_id 
        ? supabase.from("students").select("name").eq("room_id", studentData.room_id).neq("id", studentData.id)
        : Promise.resolve({ data: [], error: null });

      const [complaintsRes, maintenanceRes, roommatesRes] = await Promise.all([
        supabase.from("complaints").select("*").eq("student_id", user.id).order("created_at", { ascending: false }),
        supabase.from("maintenance_requests").select("*").eq("student_id", user.id).order("created_at", { ascending: false }),
        roommatesPromise
      ]);

      if (complaintsRes.error) throw complaintsRes.error;
      if (maintenanceRes.error) throw maintenanceRes.error;
      if (roommatesRes.error) throw roommatesRes.error;

      const complaintsData = complaintsRes.data;
      const maintenanceData = maintenanceRes.data;
      const roommateData = roommatesRes.data || [];

      // Update state
      console.log("🧩 [Student] Updating state with fetched data...");
      setComplaints(complaintsData || []);
      setMaintenanceRequests(maintenanceData || []);
      setRoommates(roommateData);
      setCurrentStudent(studentData);

      // Load Gate Passes for student
      try {
        const { data: gpData, error: gpErr } = await supabase.from('gate_passes').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
        if (!gpErr && gpData && gpData.length > 0) {
          setGatePasses(gpData);
        } else {
          const saved = localStorage.getItem('hostelhub_gate_passes');
          let parsed: GatePass[] = saved ? JSON.parse(saved) : [];
          let userPasses = parsed.filter(p => p.student_id === user.id);
          if (userPasses.length === 0) {
            const initialPass: GatePass = {
              id: Date.now(),
              created_at: new Date(Date.now() - 86400000).toISOString(),
              student_id: user.id,
              student_name: studentData.name,
              room_number: studentData.rooms?.room_number || '101',
              departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              return_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
              reason: 'Weekend Home Visit',
              destination: 'Family Residence',
              parent_contact: '+1 (555) 019-2831',
              status: 'Approved',
              approved_by: 'Hostel Warden',
              approved_at: new Date().toISOString()
            };
            parsed.unshift(initialPass);
            localStorage.setItem('hostelhub_gate_passes', JSON.stringify(parsed));
            userPasses = [initialPass];
          }
          setGatePasses(userPasses);
        }
      } catch (e) {
        console.warn('Gate pass student fetch fallback handled');
      }

      // Load Payment Record for student
      try {
        const { data: payData, error: payErr } = await supabase.from('payments').select('*').eq('student_id', user.id).maybeSingle();
        if (!payErr && payData) {
          setPaymentRecords([payData]);
        } else {
          const savedPay = localStorage.getItem('hostelhub_payments');
          let parsedPay: PaymentRecord[] = savedPay ? JSON.parse(savedPay) : [];
          let userPay = parsedPay.find(p => p.student_id === user.id);
          if (!userPay) {
            userPay = {
              id: Date.now(),
              created_at: new Date(Date.now() - 604800000).toISOString(),
              student_id: user.id,
              student_name: studentData.name,
              room_number: studentData.rooms?.room_number || '101',
              academic_year: '2025/2026',
              semester: 'Full Session',
              amount: 1200,
              status: 'Paid',
              payment_date: new Date(Date.now() - 500000000).toISOString().split('T')[0],
              receipt_number: `HH-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              payment_method: 'Online'
            };
            parsedPay.push(userPay);
            localStorage.setItem('hostelhub_payments', JSON.stringify(parsedPay));
          }
          setPaymentRecords([userPay]);
        }
      } catch (e) {
        console.warn('Payment student fetch fallback handled');
      }

      // Generate student notifications
      const studentNotes: HostelNotification[] = [
        {
          id: 'note-st-1',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          title: 'Gate Pass Approved',
          message: 'Your weekend digital out-pass has been approved by the hostel warden.',
          type: 'gatepass',
          read: false
        },
        {
          id: 'note-st-2',
          created_at: new Date(Date.now() - 14400000).toISOString(),
          title: 'Room Allocation Confirmed',
          message: studentData.rooms ? `You are assigned to Room ${studentData.rooms.room_number}.` : 'Room allocation in progress.',
          type: 'info',
          read: true
        }
      ];
      setNotifications(studentNotes);

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
    
    if (error.message.includes('timeout') || error.message.includes('Fetch') || error.message.includes('network') || error.message.includes('connection')) {
        setConnectionError(error.message);
    } else {
        setUserRole(null);
        if (userRole !== "admin") {
          setCurrentStudent(null);
        }
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
        setViewingLandingPage(true);
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

    const handleUploadAvatar = async (file: File) => {
        if (!currentStudent || !session) return;
        
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentStudent.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('students')
                .update({ avatar_url: publicUrl })
                .eq('id', currentStudent.id);

            if (updateError) {
                throw updateError;
            }

            setCurrentStudent({ ...currentStudent, avatar_url: publicUrl });
            showNotification("Profile picture updated successfully!");
        } catch (error: any) {
            console.error("Upload error:", error);
            showNotification(`Failed to upload picture: ${error.message}`);
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

    const handleGatePassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!gatePassDeparture || !gatePassReturn || !gatePassReason.trim() || !gatePassDestination.trim() || !gatePassParentContact.trim()) {
            setFormError("All fields are required.");
            return;
        }

        if (!currentStudent || !currentStudent.rooms) {
            setFormError("You must be assigned a room before requesting a gate pass.");
            return;
        }

        const newPass: GatePass = {
            id: Date.now(),
            created_at: new Date().toISOString(),
            student_id: currentStudent.id,
            student_name: currentStudent.name,
            room_number: currentStudent.rooms.room_number,
            departure_date: gatePassDeparture,
            return_date: gatePassReturn,
            reason: gatePassReason,
            destination: gatePassDestination,
            parent_contact: gatePassParentContact,
            status: 'Pending'
        };

        try {
            const { data, error } = await supabase.from('gate_passes').insert({
                student_id: currentStudent.id,
                student_name: currentStudent.name,
                room_number: currentStudent.rooms.room_number,
                departure_date: gatePassDeparture,
                return_date: gatePassReturn,
                reason: gatePassReason,
                destination: gatePassDestination,
                parent_contact: gatePassParentContact,
                status: 'Pending'
            }).select().maybeSingle();

            if (!error && data) {
                setGatePasses([data, ...gatePasses]);
            } else {
                // Fallback to local persistence
                const updated = [newPass, ...gatePasses];
                setGatePasses(updated);
                localStorage.setItem('hostelhub_gate_passes', JSON.stringify(updated));
            }
            showNotification("Gate pass request submitted successfully! Awaiting warden approval.");
            closeModal();
        } catch (err: any) {
            const updated = [newPass, ...gatePasses];
            setGatePasses(updated);
            localStorage.setItem('hostelhub_gate_passes', JSON.stringify(updated));
            showNotification("Gate pass requested successfully!");
            closeModal();
        }
    };

    const handleUpdateGatePassStatus = async (id: number, status: 'Approved' | 'Rejected') => {
        try {
            await supabase.from('gate_passes').update({
                status,
                approved_by: 'Hostel Administration',
                approved_at: new Date().toISOString()
            }).eq('id', id);
        } catch (e) {
            console.log("Supabase gate pass update fallback");
        }

        const updated = gatePasses.map(p => p.id === id ? {
            ...p,
            status,
            approved_by: 'Hostel Administration',
            approved_at: new Date().toISOString()
        } : p);
        setGatePasses(updated);
        localStorage.setItem('hostelhub_gate_passes', JSON.stringify(updated));
        showNotification(`Gate Pass marked as ${status}.`);
    };

    const handleUpdatePaymentStatus = async (id: number, status: 'Paid' | 'Pending') => {
        try {
            await supabase.from('payments').update({
                status,
                payment_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : null
            }).eq('id', id);
        } catch (e) {
            console.log("Supabase payment update fallback");
        }

        const updated = paymentRecords.map(p => p.id === id ? {
            ...p,
            status,
            payment_date: status === 'Paid' ? (p.payment_date || new Date().toISOString().split('T')[0]) : undefined
        } : p);
        setPaymentRecords(updated);
        localStorage.setItem('hostelhub_payments', JSON.stringify(updated));
        showNotification(`Payment status updated to ${status}.`);
    };

    const handleMarkNotificationRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleClearAllNotifications = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        showNotification("All notifications marked as read.");
    };

    const handleGenerateAnnouncement = async () => {
        if (!aiPrompt.trim()) {
            setFormError("Please enter a topic for the announcement.");
            return;
        }
        setIsGenerating(true);
        setFormError(null);
        try {
            const genAI = new GoogleGenerativeAI(googleApiKey);
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
                                type: SchemaType.STRING,
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
        setStudentSearchTerm('');
        setComplaintSearchTerm('');
        setComplaintStatusFilter('All');
        setMaintenanceDescription('');
        setMaintenanceCategory('Plumbing');
        setMaintenanceUrgency('Medium');
        setMaintenanceSearchTerm('');
        setMaintenanceStatusFilter('All');
        // Reset gate pass & payment states
        setGatePassDeparture('');
        setGatePassReturn('');
        setGatePassReason('');
        setGatePassDestination('');
        setGatePassParentContact('');
        setGatePassSearchTerm('');
        setGatePassStatusFilter('All');
        setPaymentSearchTerm('');
        setPaymentStatusFilter('All');
        setSelectedPaymentRecord(null);
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

            case 'requestGatePass':
                return (
                    <form onSubmit={handleGatePassSubmit} className="space-y-4 text-left">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
                            <strong>Hostel Out-Pass Policy:</strong> Out-passes must be submitted at least 24 hours prior to departure and require warden approval.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Departure Date</label>
                                <input 
                                    type="date" 
                                    value={gatePassDeparture} 
                                    onChange={e => setGatePassDeparture(e.target.value)} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Expected Return Date</label>
                                <input 
                                    type="date" 
                                    value={gatePassReturn} 
                                    onChange={e => setGatePassReturn(e.target.value)} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                    required 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Destination Address / City</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Family Home, Ikeja, Lagos" 
                                value={gatePassDestination} 
                                onChange={e => setGatePassDestination(e.target.value)} 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Parent / Guardian Phone Number</label>
                            <input 
                                type="tel" 
                                placeholder="e.g., +234 801 234 5678" 
                                value={gatePassParentContact} 
                                onChange={e => setGatePassParentContact(e.target.value)} 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-bold text-gray-700 dark:text-gray-300">Reason for Leave</label>
                            <textarea 
                                rows={3} 
                                placeholder="Please detail the reason for requesting leave..." 
                                value={gatePassReason} 
                                onChange={e => setGatePassReason(e.target.value)} 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                required 
                            />
                        </div>
                        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
                        <button 
                            type="submit" 
                            className="w-full text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-bold rounded-xl text-sm px-5 py-3 text-center shadow-lg shadow-purple-500/20"
                        >
                            Submit Out-Pass Request
                        </button>
                    </form>
                );

            case 'viewGatePasses':
                let passesToShow = userRole === 'admin' ? gatePasses : gatePasses.filter(p => p.student_id === session?.user.id);
                if (gatePassStatusFilter !== 'All') {
                    passesToShow = passesToShow.filter(p => p.status === gatePassStatusFilter);
                }
                if (gatePassSearchTerm) {
                    const term = gatePassSearchTerm.toLowerCase();
                    passesToShow = passesToShow.filter(p => 
                        p.student_name.toLowerCase().includes(term) ||
                        p.destination.toLowerCase().includes(term) ||
                        p.room_number.toLowerCase().includes(term) ||
                        p.reason.toLowerCase().includes(term)
                    );
                }

                return (
                    <div className="space-y-4">
                        {userRole === 'admin' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by student, room, destination..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={gatePassSearchTerm}
                                    onChange={e => setGatePassSearchTerm(e.target.value)}
                                />
                                <div className="flex gap-1 flex-shrink-0">
                                    {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setGatePassStatusFilter(status)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${gatePassStatusFilter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="max-h-96 overflow-y-auto space-y-3">
                            {passesToShow.length === 0 && (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <p className="font-semibold">No gate passes found.</p>
                                    {userRole !== 'admin' && (
                                        <button 
                                            onClick={() => openModal('requestGatePass')}
                                            className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                        >
                                            + Request a Gate Pass
                                        </button>
                                    )}
                                </div>
                            )}

                            {passesToShow.map(pass => (
                                <div key={pass.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{pass.student_name}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 font-medium">Room {pass.room_number}</span>
                                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                                                pass.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                                                pass.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                                                'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            }`}>
                                                {pass.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300"><strong>Destination:</strong> {pass.destination}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300"><strong>Period:</strong> {pass.departure_date} ➔ {pass.return_date}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{pass.reason}"</p>
                                        <p className="text-[11px] text-gray-400">Emergency: {pass.parent_contact}</p>
                                    </div>

                                    {userRole === 'admin' ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {pass.status !== 'Approved' && (
                                                <button 
                                                    onClick={() => handleUpdateGatePassStatus(pass.id, 'Approved')} 
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {pass.status !== 'Rejected' && (
                                                <button 
                                                    onClick={() => handleUpdateGatePassStatus(pass.id, 'Rejected')} 
                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        pass.status === 'Approved' && (
                                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-dashed border-emerald-400 text-center flex-shrink-0">
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">SECURITY PASS #</span>
                                                <span className="font-mono text-xs font-black text-gray-800 dark:text-gray-100">GP-{pass.id.toString().slice(-6)}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'viewPaymentReceipt':
                const activePayment = selectedPaymentRecord || paymentRecords.find(p => p.student_id === session?.user.id) || (paymentRecords.length > 0 ? paymentRecords[0] : null);
                const receiptStudent = students.find(s => s.id === activePayment?.student_id) || currentStudent;
                return (
                    <CustomReceipt
                        payment={activePayment}
                        student={receiptStudent}
                        onClose={closeModal}
                    />
                );

            case 'managePayments':
                let paymentsToShow = paymentRecords;
                if (paymentStatusFilter !== 'All') {
                    paymentsToShow = paymentsToShow.filter(p => p.status === paymentStatusFilter);
                }
                if (paymentSearchTerm) {
                    const term = paymentSearchTerm.toLowerCase();
                    paymentsToShow = paymentsToShow.filter(p =>
                        p.student_name.toLowerCase().includes(term) ||
                        p.room_number.toLowerCase().includes(term) ||
                        p.receipt_number.toLowerCase().includes(term)
                    );
                }

                const totalPaidAmount = paymentRecords.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
                const totalPendingAmount = paymentRecords.filter(p => p.status !== 'Paid').reduce((acc, p) => acc + p.amount, 0);

                return (
                    <div className="space-y-4 text-left">
                        {/* Summary Header */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Total Collected</span>
                                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">${totalPaidAmount.toLocaleString()} USD</span>
                            </div>
                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Outstanding Dues</span>
                                <span className="text-lg font-black text-amber-700 dark:text-amber-300">${totalPendingAmount.toLocaleString()} USD</span>
                            </div>
                        </div>

                        {/* Filter & Search */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Search by student name, room #, receipt..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={paymentSearchTerm}
                                onChange={e => setPaymentSearchTerm(e.target.value)}
                            />
                            <div className="flex gap-1 flex-shrink-0">
                                {(['All', 'Paid', 'Pending'] as const).map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setPaymentStatusFilter(st)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${paymentStatusFilter === st ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2.5">Student</th>
                                        <th className="px-3 py-2.5">Room</th>
                                        <th className="px-3 py-2.5">Amount</th>
                                        <th className="px-3 py-2.5">Status</th>
                                        <th className="px-3 py-2.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentsToShow.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-4">No payment records found.</td></tr>
                                    )}
                                    {paymentsToShow.map(pay => (
                                        <tr key={pay.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">{pay.student_name}</td>
                                            <td className="px-3 py-3">Room {pay.room_number}</td>
                                            <td className="px-3 py-3 font-extrabold text-gray-800 dark:text-gray-200">${pay.amount}</td>
                                            <td className="px-3 py-3">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPaymentRecord(pay);
                                                        openModal('viewPaymentReceipt');
                                                    }}
                                                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    Receipt
                                                </button>
                                                <button
                                                    onClick={() => handleUpdatePaymentStatus(pay.id, pay.status === 'Paid' ? 'Pending' : 'Paid')}
                                                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {pay.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'viewNotifications':
                return (
                    <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{notifications.filter(n => !n.read).length} unread updates</span>
                            <button
                                onClick={handleClearAllNotifications}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2.5">
                            {notifications.length === 0 ? (
                                <p className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">You are all caught up!</p>
                            ) : (
                                notifications.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleMarkNotificationRead(item.id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${item.read ? 'bg-white/40 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700' : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-sm'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                {!item.read && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                                                <h4 className="font-bold text-xs text-gray-900 dark:text-white">{item.title}</h4>
                                            </div>
                                            <span className="text-[9px] text-gray-400">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{item.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
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
            case 'requestGatePass':
                return 'Apply for Digital Gate Pass';
            case 'viewGatePasses':
                return userRole === 'admin' ? 'Review Gate Pass Requests' : 'My Digital Gate Passes';
            case 'viewPaymentReceipt':
                return 'Hostel Accommodation Receipt';
            case 'managePayments':
                return 'Hostel Fee & Payment Records';
            case 'viewNotifications':
                return 'Notification Center';
            default:
                return '';
        }
    };

    // Calculate statistics for the admin dashboard
    const assignedStudentsCount = students.filter(s => s.room_id !== null).length;
    const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((assignedStudentsCount / totalCapacity) * 100) : 0;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    const pendingMaintenanceCount = maintenanceRequests.filter(r => r.status !== 'Completed').length;
    const pendingGatePassesCount = gatePasses.filter(p => p.status === 'Pending').length;
    const paidStudentsCount = paymentRecords.filter(p => p.status === 'Paid').length;
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    
    if (appStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Connecting to Database...</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading your profile data</p>
            </div>
        );
    }

    if (isUpdatingPassword) {
        return <UpdatePasswordForm onPasswordUpdated={() => {
            showNotification("Password updated successfully. Please sign in again.");
            handleLogout();
        }} />;
    }

    if (connectionError) {
        return (
            <div className="font-sans min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
                {/* Background Image of Campus with Ken Burns effect */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.85] dark:opacity-[0.85] transition-opacity duration-300 scale-105 animate-ken-burns"
                    style={{ backgroundImage: "url('/university_campus.png')" }}
                ></div>
                {/* Moving grid removed as requested */}
                {/* Moving blur blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/10 blur-[120px] animate-blob1"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/10 blur-[120px] animate-blob2"></div>

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div className="relative w-full max-w-md p-8 sm:p-10 text-center backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-red-500 before:to-pink-500 before:rounded-t-3xl">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Connection Error</h2>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {connectionError}
                        </p>
                        <button 
                            onClick={() => {
                                if (session) {
                                    setConnectionError(null);
                                    fetchData(session.user);
                                } else {
                                    handleLogout();
                                }
                            }}
                            className="mt-6 w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg shadow-red-500/20 active:scale-[0.99] hover:scale-[1.01] transition-all duration-200"
                        >
                            Retry Connection
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="mt-4 text-xs font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        >
                            Go Back to Sign In
                        </button>
                    </div>
                </div>
                <style>{`
                    @keyframes grid-drift {
                        0% { background-position: 0 0; }
                        100% { background-position: 40px 40px; }
                    }
                    .animate-grid-drift {
                        animation: grid-drift 20s linear infinite;
                    }
                    @keyframes ken-burns {
                        0% { transform: scale(1.05) translate(0px, 0px); }
                        50% { transform: scale(1.12) translate(8px, -8px); }
                        100% { transform: scale(1.05) translate(0px, 0px); }
                    }
                    .animate-ken-burns {
                        animation: ken-burns 45s ease-in-out infinite;
                    }
                    @keyframes blob1 {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -40px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.95); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    @keyframes blob2 {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(-40px, 30px) scale(0.9); }
                        66% { transform: translate(30px, -20px) scale(1.05); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animate-blob1 {
                        animation: blob1 25s infinite ease-in-out;
                    }
                    .animate-blob2 {
                        animation: blob2 20s infinite ease-in-out;
                    }
                    .bg-grid-pattern {
                        background-size: 40px 40px;
                        background-image: 
                            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
                    }
                    .dark .bg-grid-pattern {
                        background-image: 
                            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* Universal Animated Moving Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Background Image of Campus with Ken Burns effect */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.85] dark:opacity-[0.85] transition-opacity duration-300 scale-105 animate-ken-burns"
                    style={{ backgroundImage: "url('/university_campus.png')" }}
                ></div>
                {/* Moving grid removed as requested */}
                {/* Moving blur blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/10 blur-[120px] animate-blob1"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-900/10 blur-[120px] animate-blob2"></div>
                <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/15 dark:bg-indigo-950/10 blur-[100px] animate-blob3"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {!session ? (
                viewingLandingPage ? (
                    <HomePage 
                        onEnterApp={(view = 'signin') => {
                            setLoginInitialView(view);
                            setViewingLandingPage(false);
                        }}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                ) : (
                    <Login 
                        onBack={() => setViewingLandingPage(true)}
                        initialView={loginInitialView}
                    />
                )
            ) : (
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
                    onManageGatePasses={() => openModal('viewGatePasses')}
                    onManagePayments={() => openModal('managePayments')}
                    onViewNotifications={() => openModal('viewNotifications')}
                    isAllocating={isAllocating}
                    totalStudents={students.length}
                    assignedStudents={assignedStudentsCount}
                    occupancyPercentage={occupancyPercentage}
                    pendingComplaints={pendingComplaintsCount}
                    pendingMaintenance={pendingMaintenanceCount}
                    pendingGatePasses={pendingGatePassesCount}
                    paidStudentsCount={paidStudentsCount}
                    unreadNotificationsCount={unreadNotificationsCount}
                    theme={theme}
                    toggleTheme={toggleTheme}
                /> :
                <StudentDashboard
                    student={currentStudent}
                    complaints={complaints}
                    gatePasses={gatePasses.filter(p => p.student_id === session?.user.id)}
                    paymentRecord={paymentRecords.find(p => p.student_id === session?.user.id) || (paymentRecords.length > 0 ? paymentRecords[0] : null)}
                    unreadNotificationsCount={unreadNotificationsCount}
                    onLogout={handleLogout}
                    onSubmitComplaint={() => openModal('submitComplaint')}
                    onViewComplaints={() => openModal('viewComplaints')}
                    onViewRoommates={() => openModal('viewRoommates')}
                    onViewAnnouncements={() => openModal('viewAnnouncements')}
                    onEditProfile={handleOpenEditProfile}
                    onSubmitMaintenance={() => openModal('submitMaintenance')}
                    onRequestGatePass={() => openModal('requestGatePass')}
                    onViewGatePasses={() => openModal('viewGatePasses')}
                    onViewPaymentReceipt={() => openModal('viewPaymentReceipt')}
                    onViewNotifications={() => openModal('viewNotifications')}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onUploadAvatar={handleUploadAvatar}
                />
            )}

            <Modal 
                isOpen={activeModal !== null} 
                onClose={closeModal} 
                title={getModalTitle()}
                maxWidth={
                    activeModal === 'viewGatePasses' || activeModal === 'managePayments' || activeModal === 'viewPaymentReceipt' || activeModal === 'viewComplaints' || activeModal === 'viewMaintenance' || activeModal === 'view'
                        ? 'max-w-2xl'
                        : 'max-w-md'
                }
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

                @keyframes grid-drift {
                    0% { background-position: 0 0; }
                    100% { background-position: 40px 40px; }
                }
                .animate-grid-drift {
                    animation: grid-drift 20s linear infinite;
                }

                @keyframes blob1 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes blob2 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(0.9); }
                    66% { transform: translate(30px, -20px) scale(1.05); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes blob3 {
                    0% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(20px, -30px) scale(1.03); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob1 {
                    animation: blob1 25s infinite ease-in-out;
                }
                .animate-blob2 {
                    animation: blob2 20s infinite ease-in-out;
                }
                .animate-blob3 {
                    animation: blob3 22s infinite ease-in-out;
                }

                @keyframes ken-burns {
                    0% { transform: scale(1.05) translate(0px, 0px); }
                    50% { transform: scale(1.12) translate(8px, -8px); }
                    100% { transform: scale(1.05) translate(0px, 0px); }
                }
                .animate-ken-burns {
                    animation: ken-burns 45s ease-in-out infinite;
                }

                .bg-grid-pattern {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
                }
                .dark .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                }
            `}</style>
            </div>
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