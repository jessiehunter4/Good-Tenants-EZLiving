
import { useNavigate } from "react-router-dom";
import { dashboardPathFor } from '@/features/access/dashboardPath';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import PropertyForm from "@/components/shared/form/PropertyForm";
import { useDataOperation } from "@/hooks/useDataOperation";
import { useToast } from "@/hooks/use-toast";

const CreateProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { executeOperation, isLoading } = useDataOperation();
  const { toast } = useToast();

  const onSubmit = async (values: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a property listing.",
        variant: "destructive",
      });
      return;
    }

    await executeOperation(
      async () => {
        // Format the available date
        const availableDate = format(values.available_date, 'yyyy-MM-dd');

        const result = await supabase
          .from("listings")
          .insert({
            owner_id: user.id,
            property_type: values.property_type,
            listing_status: values.listing_status,
            address: values.address,
            city: values.city,
            state: values.state,
            zip: values.zip,
            bedrooms: values.bedrooms,
            full_baths: values.full_baths,
            three_quarter_baths: values.three_quarter_baths,
            half_baths: values.half_baths,
            square_feet: values.square_feet,
            price: values.price,
            available_date: availableDate,
            pets_allowed: values.pets_allowed,
            description: values.description || null,
            is_active: true,
            featured: true, // All new listings are featured by default
          })
          .select()
          .single();

        return result;
      },
      {
        successMessage: "Your property listing has been created successfully! You now have access to the tenant directory.",
        errorMessage: "There was a problem creating your property listing. Please try again.",
        onSuccess: () => {
          navigate(dashboardPathFor(user?.user_metadata?.role));
        },
      }
    );
  };

  const handleCancel = () => {
    // Redirect back to dashboard based on user role
    const userRole = user?.user_metadata?.role;
    if (userRole === 'landlord') {
      navigate("/dashboard-landlord");
    } else if (userRole === 'agent') {
      navigate("/dashboard-agent");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Create Your Property Listing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To access our tenant directory, please create at least one property listing. 
            This helps ensure all landlords and agents have active properties available for our tenants.
          </p>
        </div>
        
        <PropertyForm 
          onSubmit={onSubmit}
          isSubmitting={isLoading}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateProperty;
