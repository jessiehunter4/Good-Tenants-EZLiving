import RoleBadge from "./roleBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminUser {
  id: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
}

interface UserTableProps {
  users: AdminUser[];
}

/** Dates arrive as ISO strings, and occasionally as null from a view. */
const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "—";

const UserTable = ({ users }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No users yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id ?? user.email}>
              <TableCell className="font-medium">{user.email ?? "—"}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {formatDate(user.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
