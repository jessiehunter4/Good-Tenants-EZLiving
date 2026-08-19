
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import ProfileForm from "@/components/shared/form/ProfileForm";
import { useDataOperation } from "@/hooks/useDataOperation";
import { createProfileSchema } from "@/lib/form-validation";

const OnboardAgent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { executeOperation, isLoading } = useDataOperation();
  
  // Use the shared validation schema from form-validation.ts
  const agentSchema = createProfileSchema("agent");
  
  const form = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      license_number: "",
      agency: "",
      years_experience: 0,
      bio: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof agentSchema>) => {
    if (!user) return;

    // Use the executeOperation function from useDataOperation for consistent error handling
    await executeOperation(
      async () => {
        const result = await supabase
          .from("realtor_profiles")
          .update({
            license_number: values.license_number,
            agency: values.agency,
            years_experience: values.years_experience,
            bio: values.bio || "",
            status: "basic", // Update status to basic after completing onboarding
          })
          .eq("id", user.id)
          .then(result => result);
        return result;
      },
      {
        successMessage: "Your agent profile has been created successfully.",
        errorMessage: "There was a problem updating your profile. Please try again.",
        onSuccess: () => navigate("/dashboard-agent"),
      }
    );
  };

  // Define form fields for ProfileForm with proper literal type values
  const formFields = [
    {
      name: "license_number",
      label: "License Number",
      description: "Your real estate license identification number.",
      placeholder: "e.g. CA01234567",
    },
    {
      name: "agency",
      label: "Agency/Brokerage",
      description: "The real estate agency or brokerage you work with.",
      placeholder: "e.g. Century 21, Keller Williams",
    },
    {
      name: "years_experience",
      label: "Years of Experience",
      description: "How many years you've been a licensed real estate professional.",
      type: "number",
    },
    {
      name: "bio",
      label: "Professional Bio",
      description: "Brief professional description, areas of expertise, etc.",
      component: "textarea" as const, // Using 'as const' to ensure literal type
      placeholder: "Tell us about your experience and specialties...",
    },
  ];

  const handleCancel = () => navigate("/");

  return (
    <ProfileForm
      title="Complete Your Agent Profile"
      description="Please provide your real estate license and agency information."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isLoading}
      onCancel={handleCancel}
      fields={formFields}
      submitButtonText="Save and Continue"
      cancelButtonText="Back to Home"
    />
  );
};

export default OnboardAgent;
