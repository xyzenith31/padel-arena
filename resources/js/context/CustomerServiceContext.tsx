import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

export interface TicketResponse {
  id: number;
  user_id: number;
  message: string;
  photo_path: string | null;
  created_at: string;
  user?: { name: string; role: string };
}

export interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  category: string;
  description: string;
  photo_path: string | null;
  status: string;
  created_at: string;
  user?: { name: string; email: string };
  responses?: TicketResponse[];
}

interface ComplaintFormData {
  subject: string;
  category: string;
  description: string;
  photo?: File | null;
}

interface CustomerServiceContextType {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  resolveTicket: (id: number, photo: File, message?: string) => Promise<boolean>;
  updateTicketStatus: (id: number, status: string) => Promise<boolean>;
  fetchTickets: () => Promise<void>;
  fetchTicketDetail: (id: number) => Promise<void>;
  submitComplaint: (data: ComplaintFormData) => Promise<boolean>;
  sendReply: (ticketId: number, message: string, photo?: File | null) => Promise<boolean>;
}

const CustomerServiceContext = createContext<CustomerServiceContextType | undefined>(undefined);

export const CustomerServiceProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/customer-service");
      setTickets(response.data);
    } catch (err: any) {
      setError("Gagal memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (id: number, status: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/customer-service/${id}/status`, { status });
      
      setTickets((prev) => 
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      
      if (currentTicket && currentTicket.id === id) {
          setCurrentTicket({ ...currentTicket, status });
      }

      return true;
    } catch (err: any) {
      console.error(err);
      setError("Gagal memperbarui status.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTicketDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/customer-service/${id}`);
      setCurrentTicket(response.data);
    } catch (err: any) {
        console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComplaint = async (data: ComplaintFormData): Promise<boolean> => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("category", data.category);
    formData.append("description", data.description);
    if (data.photo) formData.append("photo", data.photo);

    try {
      await axios.post("/api/customer-service", formData);
      await fetchTickets();
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendReply = async (ticketId: number, message: string, photo?: File | null): Promise<boolean> => {
    const formData = new FormData();
    formData.append("message", message);
    if (photo) formData.append("photo", photo);

    try {
      await axios.post(`/api/customer-service/${ticketId}/reply`, formData);
      await fetchTicketDetail(ticketId);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const resolveTicket = async (id: number, photo: File, message?: string): Promise<boolean> => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("photo", photo);
    if (message) formData.append("message", message);

    try {
      await axios.post(`/api/customer-service/${id}/resolve`, formData);
      
      await fetchTicketDetail(id);
      await fetchTickets();
      
      return true;
    } catch (err: any) {
      console.error(err);
      setError("Gagal menyelesaikan tiket.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerServiceContext.Provider value={{ tickets, currentTicket, isLoading, error, updateTicketStatus, resolveTicket, fetchTickets, fetchTicketDetail, submitComplaint, sendReply }}>
      {children}
    </CustomerServiceContext.Provider>
  );
};

export const useCustomerService = () => {
    const context = useContext(CustomerServiceContext);
    if (!context) throw new Error("useCustomerService error");
    return context;
};