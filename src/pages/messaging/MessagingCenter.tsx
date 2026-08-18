
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ThreadList from "@/components/messaging/ThreadList";
import MessageThread from "@/components/messaging/MessageThread";
import NewThreadDialog from "@/components/messaging/NewThreadDialog";
import DashboardHeader from "@/components/shared/DashboardHeader";
import { FeatureGate } from "@/components/access";
import { useAuth } from "@/contexts/AuthContext";

const MessagingCenter: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(threadId);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (threadId) {
      setSelectedThreadId(threadId);
    }
  }, [threadId]);
  
  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    navigate(`/messages/${id}`);
  };
  
  const handleThreadCreated = (id: string) => {
    setSelectedThreadId(id);
    navigate(`/messages/${id}`);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader 
        title="Messaging Center" 
        subtitle="Manage your communications with tenants, agents and landlords"
      />
      
      <main className="container py-8">
        <FeatureGate permission="use_messaging" requiredTier="verified">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <NewThreadDialog onThreadCreated={handleThreadCreated} />
              <ThreadList 
                onSelectThread={handleSelectThread} 
                activeThreadId={selectedThreadId} 
              />
            </div>
            
            <div className="md:col-span-2">
              {selectedThreadId ? (
                <MessageThread threadId={selectedThreadId} />
              ) : (
                <div className="h-[600px] bg-muted/30 rounded-lg border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <h3 className="text-lg font-medium">No conversation selected</h3>
                    <p className="mt-1">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FeatureGate>
      </main>
    </div>
  );
};

export default MessagingCenter;
