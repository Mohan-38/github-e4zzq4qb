import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, Inquiry, Order } from '../types';

type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Utility function to convert camelCase to snake_case
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Utility function to convert object keys from camelCase to snake_case
const convertKeysToSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = toSnakeCase(key);
      acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  
  return obj;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load projects from Supabase on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    };

    fetchProjects();

    // Subscribe to changes
    const projectsSubscription = supabase
      .channel('projects_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
    };
  }, []);

  // Load inquiries from Supabase
  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        return;
      }

      setInquiries(data || []);
    };

    fetchInquiries();

    // Subscribe to changes
    const inquiriesSubscription = supabase
      .channel('inquiries_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, (payload) => {
        fetchInquiries();
      })
      .subscribe();

    return () => {
      inquiriesSubscription.unsubscribe();
    };
  }, []);

  // Load orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    };

    fetchOrders();

    // Subscribe to changes
    const ordersSubscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    // Remove imageUpload from the project data before sending to Supabase
    const { imageUpload, ...projectData } = project as any;
    
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      return;
    }

    setProjects(prevProjects => [...prevProjects, data]);
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    // Remove imageUpload from the update data before sending to Supabase
    const { imageUpload, ...dataToUpdate } = updatedData as any;
    
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(dataToUpdate);

    const { error } = await supabase
      .from('projects')
      .update(snakeCaseData)
      .eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      return;
    }

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === id
          ? { ...project, ...updatedData }
          : project
      )
    );
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return;
    }

    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };

  const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase({
      clientName: inquiry.name,
      email: inquiry.email,
      projectType: inquiry.projectType,
      budget: inquiry.budget,
      message: inquiry.message
    });

    const { data, error } = await supabase
      .from('inquiries')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding inquiry:', error);
      return;
    }

    setInquiries(prevInquiries => [...prevInquiries, data]);
  };

  const deleteInquiry = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inquiry:', error);
      return;
    }

    setInquiries(prevInquiries => prevInquiries.filter(inquiry => inquiry.id !== id));
  };

  const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert keys to snake_case
    const snakeCaseData = convertKeysToSnakeCase(order);

    const { data, error } = await supabase
      .from('orders')
      .insert([snakeCaseData])
      .select()
      .single();

    if (error) {
      console.error('Error adding order:', error);
      return;
    }

    setOrders(prevOrders => [...prevOrders, data]);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      return;
    }

    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      return;
    }

    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        inquiries,
        addInquiry,
        deleteInquiry,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};