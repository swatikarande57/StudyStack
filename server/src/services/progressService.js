import { supabase } from '../config/supabase.js';

export const getStudentProgress = async (studentId) => {
    try {
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_to', studentId);

        const overdueTasks = tasks?.filter(t => t.status !== 'completed' && new Date(t.deadline) < new Date()) || [];
        const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
        
        const weakSubjects = [];
        if (overdueTasks.length > 2) {
            const subjects = overdueTasks.map(t => t.subject || 'General');
            const mostFrequent = subjects.reduce((a, b, i, arr) => 
                (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b), null);
            weakSubjects.push(mostFrequent);
        }

        return {
            studentId,
            taskCount: tasks?.length || 0,
            overdueCount: overdueTasks.length,
            completionRate: tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
            weakSubjects,
            productivityScore: tasks?.length ? Math.max(0, 100 - (overdueTasks.length * 10)) : 0
        };
    } catch (error) {
        console.error('Progress Service Error:', error);
        return { studentId, error: 'Failed to analyze progress' };
    }
};

export const getTeacherInsights = async (teacherId) => {
    try {
        const { data: teacherProfile } = await supabase
            .from('profiles')
            .select('class_key')
            .eq('id', teacherId)
            .maybeSingle();

        const classKey = teacherProfile?.class_key;

        // Strict enforcement: A teacher MUST have a classKey to see students!
        if (!classKey) {
            return {
                totalStudents: 0,
                atRiskCount: 0,
                atRiskStudents: [],
                topPerformer: 'N/A',
                mostIgnoredSubject: 'N/A',
                classKey: null,
                students: []
            };
        }

        const query = supabase.from('profiles').select('*, student_classes!inner(class_key)').eq('role', 'student').eq('student_classes.class_key', classKey);
        const { data: rawStudents } = await query;

        const students = rawStudents?.map(s => ({
            ...s,
            classes: s.student_classes ? s.student_classes.map(c => c.class_key) : [],
            class_key: classKey
        })) || [];

        if (students.length === 0) {
            return {
                totalStudents: 0,
                atRiskCount: 0,
                atRiskStudents: [],
                topPerformer: 'N/A',
                mostIgnoredSubject: 'N/A',
                classKey,
                students: []
            };
        }

        const studentStats = await Promise.all(
            students.map(async s => {
                const progress = await getStudentProgress(s.id);
                return { ...s, ...progress };
            })
        );

        const atRiskStudents = studentStats
            .filter(s => s.taskCount > 0 && (s.overdueCount > 1 || s.completionRate < 50))
            .map(s => ({
                studentId: s.id,
                name: s.name,
                reason: s.overdueCount > 1 ? 'Missed Multiple Deadlines' : 'Low Completion Rate',
                class_key: s.class_key,
                score: s.productivityScore
            }));

        return {
            totalStudents: students.length,
            atRiskCount: atRiskStudents.length,
            atRiskStudents,
            topPerformer: studentStats.filter(s => s.taskCount > 0).sort((a, b) => b.productivityScore - a.productivityScore)[0]?.name || 'N/A',
            mostIgnoredSubject: 'General',
            classKey,
            students: studentStats.map(s => ({
                studentId: s.id,
                name: s.name,
                score: s.productivityScore,
                class_key: s.class_key
            }))
        };
    } catch (error) {
        console.error('Teacher Insights Error:', error);
        return { error: 'Failed to generate insights' };
    }
};
