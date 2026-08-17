import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "./LoginForm";

/**
 * Sign-in only.
 *
 * Registration used to be the second tab here, which gave the role choice —
 * the decision that determines someone's entire experience of the product —
 * three radio buttons inside a 448px card. It now has its own page at
 * /register, and this card links to it.
 */
const AuthCard = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <div className="mb-4 flex justify-center">
        <h1 className="text-center text-2xl font-bold text-brand">Good Tenants</h1>
      </div>
      <CardTitle className="text-center">Welcome back</CardTitle>
    </CardHeader>
    <CardContent>
      <LoginForm setActiveTab={() => undefined} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </CardContent>
    <CardFooter className="text-center text-sm text-muted-foreground">
      By continuing, you agree to Good Tenants' Terms of Service and Privacy Policy.
    </CardFooter>
  </Card>
);

export default AuthCard;
