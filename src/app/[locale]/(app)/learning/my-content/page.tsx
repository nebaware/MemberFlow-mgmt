
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Edit3, Trash2, Eye, BarChart2 } from 'lucide-react';
import { useState, useEffect } from 'react'; 

// Mock data for educator's content
interface MyContent {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Quiz';
  status: 'Published' | 'Draft' | 'Pending Review';
  createdDate: Date;
  views?: number; // Optional
}

export default function ManageMyContentPage() {
  const [myContents, setMyContents] = useState<MyContent[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/learning/my-content');
        if (response.ok) {
          const data = await response.json();
          setMyContents(data.contents || []);
        }
      } catch (error) {
        console.error('Failed to fetch learning content:', error);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <>
      <PageTitle 
        title="Manage My Learning Content" 
        description="Edit, update, or unpublish your courses and modules." 
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            My Educational Materials
          </CardTitle>
          <CardDescription>
            A list of your created educational materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myContents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myContents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>{content.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          content.status === 'Published' ? 'default' : 
                          content.status === 'Pending Review' ? 'secondary' : 
                          'outline'
                        }
                        className={
                          content.status === 'Published' ? 'bg-green-500/20 text-green-700 border-green-400' :
                          content.status === 'Pending Review' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-400' : ''
                        }
                      >
                        {content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{content.createdDate.toLocaleDateString()}</TableCell>
                    <TableCell>{content.views !== undefined ? content.views.toLocaleString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" title="View Statistics (Demo)">
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" title="View Content (Demo)">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit Content (Demo)">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete Content (Demo)" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>You have not published any content yet.</p>
              <p className="text-sm">Use the 'Create Learning Content' section to add new materials.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
