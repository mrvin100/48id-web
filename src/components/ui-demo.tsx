'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Settings,
  FileText,
  Shield,
  BarChart3,
  Search,
  Plus,
  Download,
  Upload,
} from 'lucide-react'

export function UIDemo() {
  return (
    <div className="container-admin space-y-8 py-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          48ID Admin Portal - UI Demo
        </h1>
        <p className="text-muted-foreground">
          Showcasing the configured UI framework components and design system
        </p>
      </div>

      {/* Icons Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Lucide React Icons
          </CardTitle>
          <CardDescription>
            Icons are properly configured and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Users className="h-6 w-6" />
            <FileText className="h-6 w-6" />
            <Shield className="h-6 w-6" />
            <BarChart3 className="h-6 w-6" />
            <Search className="h-6 w-6" />
            <Plus className="h-6 w-6" />
            <Download className="h-6 w-6" />
            <Upload className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* Buttons Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            shadcn/ui button components with different variants and sizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Badges Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Role Badges</CardTitle>
          <CardDescription>
            Custom styled badges for user status and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Status Badges:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="status-badge active">Active</span>
                <span className="status-badge pending">Pending</span>
                <span className="status-badge suspended">Suspended</span>
                <span className="status-badge inactive">Inactive</span>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">Role Badges:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="role-badge admin">Admin</span>
                <span className="role-badge student">Student</span>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-medium">shadcn/ui Badges:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Components Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>
            Input fields and form elements with proper styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@48id.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>
            Sample user data table with proper styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">K48-2024-001</TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>john.doe@48id.com</TableCell>
                <TableCell>
                  <span className="status-badge active">Active</span>
                </TableCell>
                <TableCell>
                  <span className="role-badge student">Student</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">K48-2024-002</TableCell>
                <TableCell>Jane Smith</TableCell>
                <TableCell>jane.smith@48id.com</TableCell>
                <TableCell>
                  <span className="status-badge pending">Pending</span>
                </TableCell>
                <TableCell>
                  <span className="role-badge admin">Admin</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Responsive Grid Demo */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Responsive Grid Layout</h2>
        <div className="grid-admin-cards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-muted-foreground text-xs">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-muted-foreground text-xs">
                +5.2% from last hour
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Activations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-muted-foreground text-xs">
                -12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-muted-foreground text-xs">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
