
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TenantProfile, LandlordProfile } from "@/types/profiles";
import { devBypassRole, devBypassSession, devBypassUser, isDevAuthBypass } from "@/lib/devBypass";

// Generic profile interface that all profiles extend
interface BaseProfile {
  id: string;
  status: string;
}

// Union type for all possible profile types
type UserProfile = TenantProfile | LandlordProfile | BaseProfile;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Roles a visitor may choose for themselves at registration. These are user
// *types* that select an onboarding flow — they carry no elevated privilege.
//
// `admin` is deliberately absent. It was previously self-assignable behind a
// registration code whose SHA-256 hash was a constant in this file; that check
// could not work in any case, because `createHash` is not a named export of
// crypto-js/sha256 (the module exports the hash function itself), so the call
// threw and was swallowed by the catch below.
//
// Elevation to admin happens server-side only. See the accompanying migration.
const SELF_ASSIGNABLE_ROLES = ["tenant", "agent", "landlord"] as const;
type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

function isSelfAssignableRole(role: string): role is SelfAssignableRole {
  return (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(role);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [resolvedRole, setResolvedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  /*
   * Read the role from the database rather than from signup metadata. The
   * `users` view resolves it out of user_roles, and its policies mean a caller
   * only ever sees their own row. 'realtor' is presented as 'agent' there, which
   * is the spelling this app's screens use.
   */
  const fetchUserRole = async (userId: string): Promise<string | null> => {
    if (isDevAuthBypass()) return devBypassRole();

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error resolving role:', error);
      return null;
    }
    return data?.role ?? null;
  };

  /*
   * The account's role, as the database records it.
   *
   * This used to read user.user_metadata.role — the value the browser supplied
   * at signup. The database stopped trusting that (see the platform baseline
   * migration), and so does this: an account that asked for `admin` at signup
   * receives no role at all, but its metadata still says "admin" forever. Left
   * as it was, the app would route that user into admin screens, which would
   * then render empty because every query is refused. Confusing, and it reads
   * like a broken page rather than a denied one.
   *
   * Resolved once per session into state below, so this stays synchronous for
   * the call sites that expect it.
   */
  const getUserRole = (): string | null => resolvedRole;

  // Fetch user profile based on role - moved outside useEffect to prevent deadlock
  const fetchUserProfile = async (userId: string, role: string): Promise<UserProfile | null> => {
    try {
      switch (role) {
        case 'tenant': {
          const { data, error } = await supabase
            .from('tenant_profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching tenant profile:', error);
            return null;
          }
          return data;
        }
        case 'agent': {
          const { data, error } = await supabase
            .from('realtor_profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching realtor profile:', error);
            return null;
          }
          return data;
        }
        case 'landlord': {
          const { data, error } = await supabase
            .from('landlord_profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching landlord profile:', error);
            return null;
          }
          return data;
        }
        default:
          return null;
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    /*
     * Development bypass. Signs in a stub user without contacting Supabase,
     * which matters here because this project's auth endpoint no longer
     * resolves: a real sign-in cannot succeed, and neither can registration.
     *
     * Returning early also skips the auth subscription entirely, so nothing
     * below issues a network call that would fail and log noise.
     */
    if (isDevAuthBypass()) {
      setSession(devBypassSession());
      setUser(devBypassUser());
      setResolvedRole(devBypassRole());
      setUserProfile(null);
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST - no async operations here to prevent deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sessionData) => {
        console.log('Auth state change:', event, sessionData?.user?.id);
        
        // Only synchronous state updates here
        setSession(sessionData);
        setUser(sessionData?.user ?? null);
        
        // Defer any Supabase calls to prevent deadlock
        if (sessionData?.user) {
          setTimeout(() => {
            fetchUserRole(sessionData.user.id).then(role => {
              setResolvedRole(role);
              if (role) {
                fetchUserProfile(sessionData.user.id, role).then(profile => {
                  setUserProfile(profile);
                });
              }
            });
          }, 0);
        } else {
          setResolvedRole(null);
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
      console.log('Initial session check:', sessionData?.user?.id);
      setSession(sessionData);
      setUser(sessionData?.user ?? null);
      
      if (sessionData?.user) {
        fetchUserRole(sessionData.user.id).then(role => {
          setResolvedRole(role);
          if (role) {
            fetchUserProfile(sessionData.user.id, role).then(profile => {
              setUserProfile(profile);
            });
          }
        });
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email format
      if (!validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      // Validate email format
      if (!validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      // Validate password strength
      if (!validatePassword(password)) {
        throw new Error("Password must be at least 8 characters and include a number and special character");
      }

      // Privileged roles are never self-assignable. This is a usability guard
      // only — the database must not trust this value either, since anyone can
      // call the Supabase auth endpoint directly.
      if (!isSelfAssignableRole(role)) {
        throw new Error("That account type cannot be self-registered.");
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email for verification instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Starting sign out process...");
      
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful, redirecting to auth page...");
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect to auth page after successful sign out
      window.location.href = "/auth";
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper function to validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate password strength
  const validatePassword = (password: string): boolean => {
    // Require at least 8 characters, 1 number, and 1 special character
    return password.length >= 8 && 
           /\d/.test(password) && 
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, loading, signIn, signUp, signOut, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
