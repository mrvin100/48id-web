'use client'

/**
 * Users Module Component
 *
 * User management interface for the 48ID Admin Portal.
 * Provides user listing, search, and management capabilities.
 *
 * Requirements: WEB-04-01, WEB-04-02
 */

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/global'
import { DataTable } from './data-table'
import { columns } from './columns'
import { User, UserStatus, UserRole } from '@/types/auth.types'

// Mock data for Sprint 2 demonstration
const mockUsers: User[] = [
  {
    id: '1',
    matricule: 'STU001',
    email: 'john.doe@student.example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: UserStatus.ACTIVE,
    role: UserRole.STUDENT,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
    lastLoginAt: '2024-03-16T09:15:00Z',
    isEmailVerified: true,
  },
  {
    id: '2',
    matricule: 'STU002',
    email: 'jane.smith@student.example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    status: UserStatus.PENDING,
    role: UserRole.STUDENT,
    createdAt: '2024-02-20T11:45:00Z',
    updatedAt: '2024-02-20T11:45:00Z',
    lastLoginAt: undefined,
    isEmailVerified: false,
  },
  {
    id: '3',
    matricule: 'ADM001',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    status: UserStatus.ACTIVE,
    role: UserRole.ADMIN,
    createdAt: '2023-12-01T08:00:00Z',
    updatedAt: '2024-03-15T16:30:00Z',
    lastLoginAt: '2024-03-17T08:45:00Z',
    isEmailVerified: true,
  },
  {
    id: '4',
    matricule: 'STU003',
    email: 'bob.wilson@student.example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    status: UserStatus.SUSPENDED,
    role: UserRole.STUDENT,
    createdAt: '2024-01-10T13:20:00Z',
    updatedAt: '2024-03-05T10:15:00Z',
    lastLoginAt: '2024-03-01T14:30:00Z',
    isEmailVerified: true,
  },
  {
    id: '5',
    matricule: 'STU004',
    email: 'alice.brown@student.example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    status: UserStatus.ACTIVE,
    role: UserRole.STUDENT,
    createdAt: '2024-02-05T09:10:00Z',
    updatedAt: '2024-03-12T11:25:00Z',
    lastLoginAt: '2024-03-16T15:20:00Z',
    isEmailVerified: true,
  },
  {
    id: '6',
    matricule: 'SYS001',
    email: 'operator@example.com',
    firstName: 'System',
    lastName: 'Operator',
    status: UserStatus.ACTIVE,
    role: UserRole.SYSTEM_OPERATOR,
    createdAt: '2023-11-15T12:00:00Z',
    updatedAt: '2024-03-14T09:45:00Z',
    lastLoginAt: '2024-03-16T17:10:00Z',
    isEmailVerified: true,
  },
  {
    id: '7',
    matricule: 'STU005',
    email: 'charlie.davis@student.example.com',
    firstName: 'Charlie',
    lastName: 'Davis',
    status: UserStatus.INACTIVE,
    role: UserRole.STUDENT,
    createdAt: '2023-09-20T14:30:00Z',
    updatedAt: '2024-01-15T16:20:00Z',
    lastLoginAt: '2024-01-10T12:45:00Z',
    isEmailVerified: true,
  },
  {
    id: '8',
    matricule: 'STU006',
    email: 'diana.miller@student.example.com',
    firstName: 'Diana',
    lastName: 'Miller',
    status: UserStatus.PENDING,
    role: UserRole.STUDENT,
    createdAt: '2024-03-10T10:15:00Z',
    updatedAt: '2024-03-10T10:15:00Z',
    lastLoginAt: undefined,
    isEmailVerified: false,
  },
  {
    id: '9',
    matricule: 'STU007',
    email: 'edward.jones@student.example.com',
    firstName: 'Edward',
    lastName: 'Jones',
    status: UserStatus.ACTIVE,
    role: UserRole.STUDENT,
    createdAt: '2024-01-25T11:40:00Z',
    updatedAt: '2024-03-11T13:55:00Z',
    lastLoginAt: '2024-03-15T10:30:00Z',
    isEmailVerified: true,
  },
  {
    id: '10',
    matricule: 'STU008',
    email: 'fiona.garcia@student.example.com',
    firstName: 'Fiona',
    lastName: 'Garcia',
    status: UserStatus.LOCKED,
    role: UserRole.STUDENT,
    createdAt: '2024-02-12T15:20:00Z',
    updatedAt: '2024-03-08T14:10:00Z',
    lastLoginAt: '2024-03-07T16:45:00Z',
    isEmailVerified: true,
  },
]

export function UsersModule() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUsers(mockUsers)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Manage user accounts and permissions"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions"
      />

      <DataTable columns={columns} data={users} />
    </div>
  )
}
