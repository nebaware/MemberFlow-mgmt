
import Image from 'next/image';
import type { LearningModule } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, ArrowRight, BookOpen, Video, Globe, Cpu, Atom, Waves, Pipette, Languages } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  module: LearningModule;
}

const iconMap: { [key: string]: React.ElementType } = {
  Video: Video,
  Globe: Globe,
  Cpu: Cpu,
  Atom: Atom,
  Waves: Waves,
  Pipette: Pipette,
  BookOpen: BookOpen,
};

export function CourseCard({ module }: CourseCardProps) {
  const IconComponent = (module as any).iconName ? iconMap[(module as any).iconName] || BookOpen : BookOpen;
  const imageSrc = (module as any).imageUrl || (module as any).thumbnail || '/images/azmera-icon.svg';
  const duration = (module as any).duration || '—';
  const rewardPoints = (module as any).rewardPoints ?? 0;
  const href = (module as any).href || `/learning/${(module as any).id || ''}`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full">
          <Image
            src={imageSrc}
            alt={module.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="farming agriculture education"
          />
           {module.language && (
            <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1">
              <Languages className="h-3 w-3" />
              {module.language}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1 flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-primary" />
          {module.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden text-ellipsis">
          {module.description}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground space-x-3">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1 text-yellow-500" />
            <span>{rewardPoints} Points</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full" size="sm">
          <Link href={href}>
            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

