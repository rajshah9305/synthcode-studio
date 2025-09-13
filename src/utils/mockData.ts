import { ChatSession, Message, AIModel } from '@/types/chat';

export const mockModels: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4O',
    description: 'Most capable model for complex reasoning and analysis',
    provider: 'OpenAI',
    maxTokens: 128000,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Excellent for coding, analysis, and creative tasks',
    provider: 'Anthropic',
    maxTokens: 200000,
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS-120B',
    description: 'Open source model with fast inference via Cerebras',
    provider: 'Cerebras',
    maxTokens: 8000,
  },
  {
    id: 'llama-3.1-70b',
    name: 'Llama 3.1 70B',
    description: 'Meta\'s powerful open-source model',
    provider: 'Meta',
    maxTokens: 32000,
  },
];

export const generateMockSessions = (): ChatSession[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      title: 'React Component Architecture',
      createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
      updatedAt: new Date(now.getTime() - 1800000), // 30 minutes ago
      messages: [
        {
          id: '1-1',
          role: 'user',
          content: 'Help me create a reusable React component for a data table',
          timestamp: new Date(now.getTime() - 3600000),
        },
        {
          id: '1-2',
          role: 'assistant',
          content: 'I\'ll help you create a flexible and reusable data table component...',
          timestamp: new Date(now.getTime() - 3580000),
          metadata: {
            responseTime: 1234,
            tokenCount: 856,
            model: 'Claude 3.5 Sonnet',
          },
        },
      ],
    },
    {
      id: '2',
      title: 'Python API Development',
      createdAt: new Date(now.getTime() - 7200000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 3600000), // 1 hour ago
      messages: [
        {
          id: '2-1',
          role: 'user',
          content: 'Create a FastAPI application with authentication',
          timestamp: new Date(now.getTime() - 7200000),
        },
        {
          id: '2-2',
          role: 'assistant',
          content: 'I\'ll create a comprehensive FastAPI application with JWT authentication...',
          timestamp: new Date(now.getTime() - 7180000),
          metadata: {
            responseTime: 987,
            tokenCount: 1234,
            model: 'GPT-4O',
          },
        },
      ],
    },
    {
      id: '3',
      title: 'Database Design Questions',
      createdAt: new Date(now.getTime() - 86400000), // 1 day ago
      updatedAt: new Date(now.getTime() - 43200000), // 12 hours ago
      messages: [
        {
          id: '3-1',
          role: 'user',
          content: 'What\'s the best approach for designing a scalable database schema?',
          timestamp: new Date(now.getTime() - 86400000),
        },
        {
          id: '3-2',
          role: 'assistant',
          content: 'Great question! Database design for scalability involves several key principles...',
          timestamp: new Date(now.getTime() - 86380000),
          metadata: {
            responseTime: 1456,
            tokenCount: 967,
            model: 'GPT-OSS-120B',
          },
        },
      ],
    },
  ];
};

export const sampleCodeArtifacts = [
  {
    id: 'react-table',
    title: 'React Data Table Component',
    language: 'tsx',
    code: `import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  pagination = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={column.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}`,
    description: 'A fully-featured, reusable React data table component with sorting, filtering, and pagination',
    isEditable: true,
  },
];

export const promptTemplates = [
  {
    title: 'Code Generation',
    template: 'Generate a [language/framework] [type of code] that [functionality]. Please include:\n- [requirement 1]\n- [requirement 2]\n- [requirement 3]\n\nMake it production-ready with error handling and documentation.',
  },
  {
    title: 'Code Review',
    template: 'Please review this code and provide feedback on:\n- Code quality and best practices\n- Performance optimizations\n- Security considerations\n- Potential bugs or issues\n\n```[language]\n[paste your code here]\n```',
  },
  {
    title: 'API Design',
    template: 'Design a RESTful API for [describe your application]. Include:\n- Endpoint structure\n- Request/response schemas\n- Authentication method\n- Error handling\n- Rate limiting considerations',
  },
  {
    title: 'Database Schema',
    template: 'Create a database schema for [describe your application] with:\n- Tables and relationships\n- Indexes for performance\n- Constraints and validations\n- Sample queries\n- Migration strategy',
  },
];