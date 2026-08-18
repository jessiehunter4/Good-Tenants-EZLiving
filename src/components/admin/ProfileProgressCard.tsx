
import { User, Briefcase, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileProgressItem {
  label: string;
  value: number;
  total: number;
  color: string;
}

interface ProfileProgressCardProps {
  title: string;
  icon: "user" | "briefcase" | "building";
  items: ProfileProgressItem[];
}

const ProfileProgressCard = ({ title, icon, items }: ProfileProgressCardProps) => {
  const renderIcon = () => {
    switch (icon) {
      case "user":
        return <User className="h-5 w-5" />;
      case "briefcase":
        return <Briefcase className="h-5 w-5" />;
      case "building":
        return <Building className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          {renderIcon()}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${item.color}`}
                  style={{
                    width: `${(item.value * 100) / (item.total || 1)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileProgressCard;
