import emailjs from '@emailjs/browser';

// Configuration
const CONFIG = {
  serviceId: 'service_qj44izj',
  publicKey: 'aImlP6dotqO-E3y6h',
  templates: {
    contact: 'template_k92zaj2',
    order: 'purchase_confirmation'
  },
  developerEmail: 'mohanselemophile@gmail.com'
};

// Type Definitions
interface ContactFormData {
  from_name: string;
  from_email: string;
  project_type: string;
  budget: string;
  message: string;
}

interface OrderConfirmationData {
  project_title: string;
  customer_name: string;
  price: string;
  download_instructions?: string;
  support_email?: string;
  order_id?: string;
}

// Utility Functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    datetime: now.toISOString()
  };
};

// Email Services
export const sendContactForm = async (data: ContactFormData): Promise<void> => {
  if (!validateEmail(data.from_email)) {
    throw new Error('Invalid sender email address');
  }

  const { date, time } = getCurrentDateTime();

  try {
    await emailjs.send(
      CONFIG.serviceId,
      CONFIG.templates.contact,
      {
        // Template variables
        name: data.from_name,          // For {{name}} in template
        email: data.from_email,        // For {{email}} in template
        project_type: data.project_type,
        budget: data.budget,
        message: data.message,
        current_date: date,
        current_time: time,
        title: `New inquiry from ${data.from_name}`,
        
        // Email headers
        to_email: CONFIG.developerEmail,
        reply_to: data.from_email
      },
      CONFIG.publicKey
    );
  } catch (error) {
    console.error('Contact form email failed:', error);
    throw new Error('Failed to send your message. Please try again later.');
  }
};

export const sendOrderConfirmation = async (
  data: OrderConfirmationData,
  recipientEmail: string
): Promise<void> => {
  if (!validateEmail(recipientEmail)) {
    throw new Error('Invalid recipient email address');
  }

  const { date } = getCurrentDateTime();

  try {
    await emailjs.send(
      CONFIG.serviceId,
      CONFIG.templates.order,
      {
        ...data,
        email: recipientEmail,       // For template variables
        current_date: date,
        to_email: recipientEmail,    // Recipient address
        reply_to: data.support_email || CONFIG.developerEmail
      },
      CONFIG.publicKey
    );
  } catch (error) {
    console.error('Order confirmation failed:', error);
    throw new Error('Failed to send order confirmation. Please try again later.');
  }
};

// Optional: Add this if you need to send test emails during development
export const testEmailService = async () => {
  try {
    await sendContactForm({
      from_name: 'Test User',
      from_email: 'test@example.com',
      project_type: 'Website Development',
      budget: '$1000-$2000',
      message: 'This is a test message from the email service'
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', error);
  }
};