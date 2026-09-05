-- ==============================================================================
-- HostelHub - Supplementary Tables Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Gate Passes Table
CREATE TABLE IF NOT EXISTS public.gate_passes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    reason TEXT NOT NULL,
    destination TEXT NOT NULL,
    parent_contact TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for gate_passes
ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read gate_passes"
ON public.gate_passes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow students to insert their own gate pass"
ON public.gate_passes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow authenticated users to update gate passes"
ON public.gate_passes FOR UPDATE
TO authenticated
USING (true);


-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025/2026',
    semester TEXT NOT NULL DEFAULT 'Full Session',
    amount NUMERIC NOT NULL DEFAULT 1200,
    status TEXT DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
    payment_date DATE DEFAULT CURRENT_DATE,
    receipt_number TEXT NOT NULL UNIQUE,
    payment_method TEXT DEFAULT 'Online'
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read payments"
ON public.payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert/update payments"
ON public.payments FOR ALL
TO authenticated
USING (true);


-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('announcement', 'complaint', 'maintenance', 'gatepass', 'payment', 'info')),
    read BOOLEAN DEFAULT false,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (student_id IS NULL OR student_id = auth.uid());

CREATE POLICY "Allow authenticated users to insert/update notifications"
ON public.notifications FOR ALL
TO authenticated
USING (true);
