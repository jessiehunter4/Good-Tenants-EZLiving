
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useDataOperation } from "@/hooks/useDataOperation";
import { tenantOnboardingSchema, TenantOnboardingFormData } from "@/lib/validation/tenantOnboardingSchema";

export const useTenantOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { executeOperation, isLoading } = useDataOperation();
  
  const form = useForm({
    resolver: zodResolver(tenantOnboardingSchema),
    defaultValues: {
      household_size: 1,
      household_income: 0,
      pets: false,
      bio: "",
      move_in_date: new Date(),
      desired_move_date: new Date(),
      move_date_flexibility: 'anytime_30_days' as const,
      max_monthly_rent: 2000,
      desired_cities: "",
      desired_state: "",
      desired_zip_code: "",
      desired_property_types: [],
      min_bedrooms: 1,
      min_bathrooms: 1,
      pets_allowed: false,
      preferred_locations: ""
    },
  });

  const onSubmit = async (values: TenantOnboardingFormData) => {
    if (!user) return;

    // Convert cities string to array
    const citiesArray = values.desired_cities
      .split(",")
      .map(city => city.trim())
      .filter(city => city.length > 0);

    // Convert preferred locations string to array (legacy field)
    const locationsArray = values.preferred_locations
      ? values.preferred_locations
          .split(",")
          .map(location => location.trim())
          .filter(location => location.length > 0)
      : [];

    // Format dates to strings for Supabase
    const moveInDate = format(values.move_in_date, 'yyyy-MM-dd');
    const desiredMoveDate = format(values.desired_move_date, 'yyyy-MM-dd');

    await executeOperation(
      async () => {
        const result = await supabase
          .from("tenant_profiles")
          .update({
            // Basic info
            move_in_date: moveInDate,
            household_size: values.household_size,
            household_income: values.household_income,
            pets: values.pets,
            preferred_locations: locationsArray,
            bio: values.bio,
            status: "basic",
            
            // New rental preferences
            desired_move_date: desiredMoveDate,
            move_date_flexibility: values.move_date_flexibility,
            max_monthly_rent: values.max_monthly_rent,
            desired_cities: citiesArray,
            desired_state: values.desired_state,
            desired_zip_code: values.desired_zip_code || null,
            desired_property_types: values.desired_property_types,
            min_bedrooms: values.min_bedrooms,
            min_bathrooms: values.min_bathrooms,
            pets_allowed: values.pets_allowed,
          })
          .eq("id", user.id);
        return result;
      },
      {
        successMessage: "Your rental preferences have been saved successfully.",
        errorMessage: "There was a problem saving your preferences. Please try again.",
        onSuccess: () => navigate("/dashboard-tenant"),
      }
    );
  };

  // The tenant dashboard, not the landing page: anyone cancelling out of
  // tenant onboarding is a signed-in tenant, and "/" is written for visitors
  // who are neither.
  const handleCancel = () => navigate("/dashboard-tenant");

  return {
    form,
    onSubmit,
    isLoading,
    handleCancel
  };
};
