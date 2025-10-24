#!/bin/bash

# Migration script to convert Pages Router to App Router structure
# This script converts TypeScript files from pages/ to app/ directory

FRONTEND_DIR="/Users/meesumali/Desktop/development/school-management-system/frontend"
cd "$FRONTEND_DIR"

echo "Starting Pages Router to App Router migration..."

# Function to convert a pages file to app router format
convert_page() {
    local src="$1"
    local dest="$2"
    
    echo "Converting: $src -> $dest"
    
    # Create destination directory
    mkdir -p "$(dirname "$dest")"
    
    # Read the file and apply transformations
    sed -e "1i\\'use client';\n" \
        -e "s|from 'next/router'|from 'next/navigation'|g" \
        -e "s|useRouter()|useRouter()|g" \
        -e "s|useParams<{ id: string }>()|useParams()|g" \
        -e "s|import { useRouter } from 'next/router'|import { useRouter } from 'next/navigation'|g" \
        -e "s|import { useNavigate, useParams } from 'react-router-dom'|import { useRouter, useParams } from 'next/navigation'|g" \
        -e "s|import { useNavigate } from 'react-router-dom'|import { useRouter } from 'next/navigation'|g" \
        -e "s|const navigate = useNavigate()|const router = useRouter()|g" \
        -e "s|navigate('|router.push('|g" \
        -e "s|navigate(\"|router.push(\"|g" \
        -e "/GetServerSideProps/d" \
        -e "/export const getServerSideProps/,/^}/d" \
        -e "s|export default function|export default function|g" \
        -e "s|: React.FC||g" \
        -e "s|const \([A-Za-z_][A-Za-z0-9_]*\): React.FC = ()|export default function \1()|g" \
        -e "s|export default \([A-Za-z_][A-Za-z0-9_]*\);||g" \
        "$src" > "$dest"
}

# Migrate specific admin pages
echo "Creating students list page..."
cat > app/admin/students/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { fetchStudents, deleteStudent } from '@/utils/api';
import { Student } from '@/types/student';
import AdminLayout from '@/components/Layout/AdminLayout';
import StudentList from '@/components/Students/StudentList';
import Notification from '@/components/Layout/Notification';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteStudent(id);
        loadStudents();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete student');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <StudentList students={students} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
EOF

echo "Creating subjects list page..."
cat > app/admin/subjects/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { fetchSubjects, deleteSubject } from '@/utils/api';
import { Subject } from '@/types/subject';
import AdminLayout from '@/components/Layout/AdminLayout';
import SubjectList from '@/components/Subjects/SubjectList';
import Notification from '@/components/Layout/Notification';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSubject(id);
        loadSubjects();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete subject');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <SubjectList subjects={subjects} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
EOF

echo "Creating users list page..."
cat > app/admin/users/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { fetchUsers, deleteUser } from '@/utils/api';
import { User } from '@/types/user';
import AdminLayout from '@/components/Layout/AdminLayout';
import UserList from '@/components/Users/UserList';
import Notification from '@/components/Layout/Notification';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <UserList users={users} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
EOF

echo "Creating schools list page..."
cat > app/admin/schools/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { fetchSchools, deleteSchool } from '@/utils/api';
import { School } from '@/types/school';
import AdminLayout from '@/components/Layout/AdminLayout';
import SchoolList from '@/components/Schools/SchoolList';
import Notification from '@/components/Layout/Notification';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSchools();
      setSchools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteSchool(id);
        loadSchools();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete school');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        {error && <Notification message={error} type="error" onClose={() => setError(null)} />}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <SchoolList schools={schools} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
EOF

echo "Migration script completed!"
echo "Next steps:"
echo "1. Review generated files in app/ directory"
echo "2. Run 'npm run build' to check for errors"
echo "3. Remove pages/ directory after verification"
