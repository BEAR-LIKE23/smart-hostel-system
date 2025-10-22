import React, { useState, useEffect } from 'react';
import type { Session, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import AdminDashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import { Modal } from './components/Modal';
import { Student, Room, Complaint, ModalType } from './types';


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


    // Data states
    const [students, setStudents] = useState<Student[]>([]);
    const [currentStudent, setCurrentStudent] = useState<Student | null | undefined>(undefined);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [roommates, setRoommates] = useState<Pick<Student, 'name'>[]>([]);
    
    // UI states
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [isAllocating, setIsAllocating] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);


    // Form states
    const [complaintDescription, setComplaintDescription] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState(4);
    const [newRoomGender, setNewRoomGender] = useState<'Male' | 'Female' | 'Mixed'>('Male');
    const [editedName, setEditedName] = useState('');
    const [editedLevel, setEditedLevel] = useState('');


    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'PASSWORD_RECOVERY') {
                setIsUpdatingPassword(true);
            }
            
            setSession(session);
            
            if (session) {
                // Don't fetch data if we are in password recovery mode, wait until it's done.
                if (_event !== 'PASSWORD_RECOVERY') {
                    setCurrentStudent(undefined);
                    await fetchData(session.user);
                }
            } else {
                setUserRole(null);
                setCurrentStudent(null);
            }
            setAppStatus('ready');
        });

        return () => subscription.unsubscribe();
    }, []);


    const fetchData = async (user: User) => {
        const role = user.email?.includes('admin') ? 'admin' : 'student';
        setUserRole(role);

        if (role === 'admin') {
            const { data: studentsData } = await supabase.from('students').select('*').order('name', { ascending: true });
            const { data: roomsData } = await supabase.from('rooms').select('*, students(count)').order('room_number', { ascending: true });
            const { data: complaintsData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
            setStudents(studentsData || []);
            setRooms(roomsData || []);
            setComplaints(complaintsData || []);
        } else { // student
            let studentData = null;
            for (let i = 0; i < 2; i++) {
                const { data } = await supabase.from('students').select('*, rooms(*)').eq('id', user.id).single();
                if (data) {
                    studentData = data;
                    break;
                }
                if (i === 0) await new Promise(resolve => setTimeout(resolve, 2000));
            }

            setCurrentStudent(studentData);

            if (studentData) {
                const { data: complaintsData } = await supabase.from('complaints').select('*').eq('student_id', user.id).order('created_at', { ascending: false });
                setComplaints(complaintsData || []);
                
                if (studentData.room_id) {
                     const { data: roommateData } = await supabase.from('students').select('name').eq('room_id', studentData.room_id).neq('id', studentData.id);
                     setRoommates(roommateData || []);
                } else {
                    setRoommates([]);
                }
            } else {
                setComplaints([]);
                setRoommates([]);
            }
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUserRole(null);
        setStudents([]);
        setRooms([]);
        setComplaints([]);
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
                .from('students')
                .select('id, gender')
                .is('room_id', null);

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
                 const { error: updateError } = await supabase.from('students').upsert(studentUpdates);
                 if (updateError) throw updateError;
            }

            showNotification(`Allocation complete. ${studentUpdates.length} students assigned to rooms.`);
            if (session) await fetchData(session.user);

        } catch (err: any) {
            showNotification(`Allocation failed: ${err.message}`);
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
        const { error } = await supabase.from('students').update({ room_id: selectedRoomId }).eq('id', studentToAssign.id);

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
    };

    // FIX: Implement `renderModalContent` to return JSX based on the active modal type.
    const renderModalContent = () => {
        switch (activeModal) {
            case 'view':
                return (
                    <div>
                        <button onClick={handleExportStudents} className="mb-4 w-full flex items-center justify-center p-2 rounded-md font-semibold transition-all duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300">Export to CSV</button>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Name</th>
                                        <th scope="col" className="px-4 py-3">Room</th>
                                        <th scope="col" className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                                            <td className="px-4 py-3">{rooms.find(r => r.id === student.room_id)?.room_number || 'Unassigned'}</td>
                                            <td className="px-4 py-3 space-x-2">
                                                {student.room_id ? (
                                                    <button onClick={() => handleUnassignRoom(student.id)} className="font-medium text-red-600 hover:underline">Unassign</button>
                                                ) : (
                                                    <button onClick={() => handleOpenAssignModal(student)} className="font-medium text-blue-600 hover:underline">Assign</button>
                                                )}
                                                <button onClick={() => handleOpenStudentProfile(student)} className="font-medium text-gray-600 hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'viewComplaints':
                const complaintsToShow = userRole === 'admin' ? complaints : complaints.filter(c => c.student_id === session?.user.id);
                return (
                    <div className="max-h-96 overflow-y-auto space-y-4">
                        {complaintsToShow.length === 0 && <p className="text-center text-gray-500">No complaints found.</p>}
                        {complaintsToShow.map(complaint => (
                            <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">{complaint.student_name} (Room {complaint.room_number})</p>
                                        <p className="text-xs text-gray-500">{new Date(complaint.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{complaint.status}</span>
                                </div>
                                <p className="mt-2 text-gray-600">{complaint.description}</p>
                                {userRole === 'admin' && (
                                    <div className="mt-3 text-right">
                                        <select
                                            onChange={(e) => updateComplaintStatus(complaint.id, e.target.value as Complaint['status'])}
                                            value={complaint.status}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
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
                );

            case 'submitComplaint':
                return (
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Complaint Description</label>
                            <textarea
                                id="description"
                                value={complaintDescription}
                                onChange={(e) => setComplaintDescription(e.target.value)}
                                rows={4}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Please describe your issue in detail..."
                                required
                            />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Submit Complaint
                        </button>
                    </form>
                );

            case 'roomOccupancy':
                return (
                    <div>
                        <button onClick={handleExportRooms} className="mb-4 w-full flex items-center justify-center p-2 rounded-md font-semibold transition-all duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300">Export to CSV</button>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
                                            <tr key={room.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{room.room_number}</td>
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
                        <p>Select a room for <strong>{studentToAssign?.name}</strong> ({studentToAssign?.gender}):</p>
                        <div>
                            <select
                                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                                defaultValue=""
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                        <button onClick={handleConfirmAssignment} disabled={!selectedRoomId} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400">
                            Confirm Assignment
                        </button>
                    </div>
                );

            case 'viewRoommates':
                return (
                    <div>
                        {roommates.length > 0 ? (
                            <ul className="space-y-2">
                                {roommates.map((mate, index) => <li key={index} className="p-2 bg-gray-100 rounded-md">{mate.name}</li>)}
                            </ul>
                        ) : <p className="text-center text-gray-500">You are the only one in this room currently.</p>}
                    </div>
                );

            case 'addRoom':
                return (
                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <div>
                            <label htmlFor="room-number" className="block mb-2 text-sm font-medium text-gray-900">Room Number</label>
                            <input type="text" id="room-number" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block mb-2 text-sm font-medium text-gray-900">Capacity</label>
                            <input type="number" id="capacity" value={newRoomCapacity} onChange={e => setNewRoomCapacity(Number(e.target.value))} min="1" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900">Gender Type</label>
                            <select id="gender" value={newRoomGender} onChange={e => setNewRoomGender(e.target.value as any)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Room</button>
                    </form>
                );

            case 'studentProfile':
                if (!selectedStudent) return <p>No student selected.</p>;
                return (
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedStudent.name}</p>
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Level:</strong> {selectedStudent.level}</p>
                        <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                        <p><strong>Room:</strong> {rooms.find(r => r.id === selectedStudent.room_id)?.room_number || 'Unassigned'}</p>
                    </div>
                );

            case 'editProfile':
                return (
                     <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
                            <input type="text" id="edit-name" value={editedName} onChange={e => setEditedName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                        </div>
                        <div>
                            <label htmlFor="edit-level" className="block mb-2 text-sm font-medium text-gray-900">Level</label>
                            <input type="text" id="edit-level" value={editedLevel} onChange={e => setEditedLevel(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required />
                        </div>
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Update Profile</button>
                    </form>
                );
            case 'postAnnouncement':
            case 'viewAnnouncements':
                return <p className="text-center text-gray-500">This feature is coming soon.</p>;
                
            default:
                return null;
        }
    };
    
    // FIX: Implement `getModalTitle` to return a string title for the modal.
    const getModalTitle = (): string => {
        switch (activeModal) {
            case 'view':
                return 'All Students';
            case 'viewComplaints':
                return userRole === 'admin' ? 'All Complaints' : 'My Complaints';
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
            default:
                return '';
        }
    };

    // Calculate statistics for the admin dashboard
    const assignedStudentsCount = students.filter(s => s.room_id !== null).length;
    const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((assignedStudentsCount / totalCapacity) * 100) : 0;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    
    if (appStatus === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <svg className="animate-spin h-10 w-10 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg text-gray-600">
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
                    isAllocating={isAllocating}
                    totalStudents={students.length}
                    assignedStudents={assignedStudentsCount}
                    occupancyPercentage={occupancyPercentage}
                    pendingComplaints={pendingComplaintsCount}
                /> :
                <StudentDashboard
                    student={currentStudent}
                    complaints={complaints}
                    onLogout={handleLogout}
                    onSubmitComplaint={() => openModal('submitComplaint')}
                    onViewComplaints={() => openModal('viewComplaints')}
                    onViewRoommates={() => openModal('viewRoommates')}
                    onEditProfile={handleOpenEditProfile}
                />
            )}

            <Modal 
                isOpen={activeModal !== null} 
                onClose={closeModal} 
                title={getModalTitle()}
            >
                {/* Modal content rendering is omitted for brevity but remains unchanged */}
                {renderModalContent()}
            </Modal>

            {notification && (
                 <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-up">
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

// NEW: Component for updating the password
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
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Update Your Password</h1>
                    <p className="mt-2 text-gray-500">Enter a new password for your account.</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handlePasswordUpdate}>
                    <input 
                        name="password" 
                        type="password"
                        required 
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="New Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:bg-amber-300">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default App;