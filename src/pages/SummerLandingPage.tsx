
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  moveInDate: z.date(),
  city: z.string().min(2, {
    message: "Please enter a valid city.",
  }),
});

const SummerLandingPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      moveInDate: new Date(),
      city: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Instead of creating a new signup, navigate to the registration page with pre-filled values
      const queryParams = new URLSearchParams({
        name: values.name,
        email: values.email,
        phone: values.phone,
        moveInDate: values.moveInDate.toISOString(),
        city: values.city,
        role: "tenant", // Default to tenant role
      });
      
      navigate(`/auth?${queryParams.toString()}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1974&auto=format&fit=crop" 
            alt="Southern California homes" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Moving This Summer?</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Good tenants get seen first. Create your free profile to start getting invited to rental listings in your area.
          </p>
          
          <div className="bg-white text-foreground rounded-lg p-6 md:p-8 max-w-2xl mx-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Find Your Next Rental – Get Invited, Not Ignored</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="moveInDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Target Move-In Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target City</FormLabel>
                        <FormControl>
                          <Input placeholder="Irvine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary text-white font-bold py-3 px-6 rounded-lg mt-4" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Profile..." : "Create My Free Profile"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-12 md:py-16 bg-muted/40">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8 text-primary">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-warning fill-yellow-400" />
                ))}
              </div>
              <p className="mb-4">"I found my dream apartment in just 3 days! Landlords were contacting me directly with available units."</p>
              <p className="font-semibold">- Sarah T., Tenant</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-warning fill-yellow-400" />
                ))}
              </div>
              <p className="mb-4">"As a landlord, I love being able to browse pre-screened tenants. It saves so much time in the leasing process."</p>
              <p className="font-semibold">- Michael R., Landlord</p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-warning fill-yellow-400" />
                ))}
              </div>
              <p className="mb-4">"This platform made it so much easier for me to find qualified tenants for my client's listings."</p>
              <p className="font-semibold">- Jennifer L., Real Estate Agent</p>
            </div>
          </div>
          
          <p className="mt-8 text-muted-foreground">Trusted by tenants and real estate professionals in Southern California</p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-12 text-center text-primary">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-role-tenant/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create your free profile</h3>
              <p className="text-muted-foreground">Sign up and complete your tenant profile with preferences and requirements.</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-role-tenant/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get matched with new listings</h3>
              <p className="text-muted-foreground">Our system matches your profile with available properties in your desired area.</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-role-tenant/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get invited by landlords and agents</h3>
              <p className="text-muted-foreground">Receive direct invitations to view properties that match your criteria.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to find your perfect rental?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join {BRAND.name} today and start receiving invitations to view properties in your area.
          </p>
          <Button 
            onClick={() => document.documentElement.scrollTop = 0} 
            size="lg"
            className="bg-white text-primary hover:bg-muted"
          >
            Start My Profile – It's Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-espresso text-sand py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</p>
            <div className="mt-2">
              <a href="#" className="text-muted-foreground hover:text-white mx-2">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-white mx-2">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SummerLandingPage;
