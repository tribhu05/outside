import React from 'react';
import { 
  Footprints, 
  Armchair, 
  Eye, 
  BookOpen, 
  PenTool, 
  Compass, 
  Users, 
  Zap, 
  Activity, 
  Sunset, 
  Bike, 
  Sparkles, 
  DoorOpen, 
  Home, 
  CheckCircle, 
  TreePine, 
  Clock, 
  DollarSign, 
  Heart, 
  LucideProps 
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const Icon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Footprints': return <Footprints {...props} />;
    case 'Armchair': return <Armchair {...props} />;
    case 'Eye': return <Eye {...props} />;
    case 'BookOpen': return <BookOpen {...props} />;
    case 'PenTool': return <PenTool {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Activity': return <Activity {...props} />;
    case 'Sunset': return <Sunset {...props} />;
    case 'Bike': return <Bike {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'DoorOpen': return <DoorOpen {...props} />;
    case 'Home': return <Home {...props} />;
    case 'CheckCircle': return <CheckCircle {...props} />;
    case 'TreePine': return <TreePine {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'DollarSign': return <DollarSign {...props} />;
    case 'Heart': return <Heart {...props} />;
    default: return <Footprints {...props} />;
  }
};
