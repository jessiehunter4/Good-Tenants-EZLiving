
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TenantProfileListItem } from "@/types/admin";

interface TenantProfileTableProps {
  tenants: TenantProfileListItem[];
}

const TenantProfileTable = ({ tenants }: TenantProfileTableProps) => {
  if (!tenants || tenants.length === 0) {
    return <div className="text-center py-8">No tenant profiles found</div>;
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>Household Size</TableHead>
            <TableHead>Move-In Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">{tenant.email}</TableCell>
              <TableCell>{tenant.household_income ? formatCurrency(tenant.household_income) : "Not specified"}</TableCell>
              <TableCell>{tenant.household_size || "Not specified"}</TableCell>
              <TableCell>
                {tenant.move_in_date 
                  ? new Date(tenant.move_in_date).toLocaleDateString() 
                  : "Not specified"}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={tenant.status === "verified" ? "default" : "outline"}
                  className={
                    tenant.status === "verified" 
                      ? "bg-green-100 text-green-800" 
                      : tenant.status === "basic"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {tenant.pets !== null ? (
                  tenant.pets ? (
                    <Badge className="bg-amber-100 text-amber-800">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )
                ) : (
                  "Not specified"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TenantProfileTable;
