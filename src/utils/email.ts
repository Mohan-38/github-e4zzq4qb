import emailjs from '@emailjs/browser';

// Configuration for all EmailJS accounts
const CONFIG = {
  // Primary Account (Order confirmations, contact forms)
  primary: {
    serviceId: 'service_qj44izj',
    publicKey: 'aImlP6dotqO-E3y6h',
    templates: {
      contact: 'template_k92zaj2',
      order: 'purchase_confirmation' // Verify this ID matches your template
    }
  },
  // Document Delivery Account (mohanfiles@gmail.com)
  documentAccount: {
    serviceId: 'service_3x190fr',      // From mohanfiles@gmail.com
    templateId: 'document_delivery',   // Confirm in EmailJS dashboard
    publicKey: 'exhGN1uuooZbFQ3HL'    // From mohanfiles@gmail.com
  },
  company: {
    name: 'Your Company Name',
    supportEmail: 'support@yourcompany.com',
    developerEmail: 'mohanselenophile@gmail.com'
  }
};

// Initialize EmailJS with the primary account by default
emailjs.init(CONFIG.primary.publicKey, {
  blockHeadless: true
});

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

interface DocumentDeliveryData {
  project_title: string;
  customer_name: string;
  customer_email: string;
  order_id: string;
  documents: Array<{
    name: string;
    url: string;
    category: string;
    review_stage: string;
  }>;
  access_expires?: string;
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
    datetime: now.toISOString(),
    year: now.getFullYear().toString()
  };
};

// Email Services

/**
 * Sends contact form email (uses primary account)
 */
export const sendContactForm = async (data: ContactFormData): Promise<void> => {
  if (!validateEmail(data.from_email)) {
    throw new Error('Invalid sender email address');
  }

  const { date, time } = getCurrentDateTime();

  try {
    await emailjs.send(
      CONFIG.primary.serviceId,
      CONFIG.primary.templates.contact,
      {
        name: data.from_name,
        email: data.from_email,
        project_type: data.project_type,
        budget: data.budget,
        message: data.message,
        current_date: date,
        current_time: time,
        title: `New inquiry from ${data.from_name}`,
        to_email: CONFIG.company.developerEmail,
        reply_to: data.from_email
      },
      CONFIG.primary.publicKey
    );
  } catch (error) {
    console.error('Contact form email failed:', {
      error: error instanceof Error ? error.message : error,
      service: CONFIG.primary.serviceId,
      template: CONFIG.primary.templates.contact
    });
    throw new Error('Failed to send your message. Please try again later.');
  }
};

/**
 * Sends order confirmation (uses primary account)
 */
export const sendOrderConfirmation = async (
  data: OrderConfirmationData,
  recipientEmail: string
): Promise<void> => {
  if (!validateEmail(recipientEmail)) {
    throw new Error('Invalid recipient email address');
  }

  const { date, year } = getCurrentDateTime();

  try {
    await emailjs.send(
      CONFIG.primary.serviceId,
      CONFIG.primary.templates.order,
      {
        ...data,
        email: recipientEmail,
        current_date: date,
        current_year: year,
        to_email: recipientEmail,
        company_name: CONFIG.company.name,
        reply_to: data.support_email || CONFIG.company.supportEmail,
        download_instructions: data.download_instructions || 
          'You will receive a separate email with download links shortly.',
        support_email: CONFIG.company.supportEmail
      },
      CONFIG.primary.publicKey
    );
  } catch (error) {
    console.error('Order confirmation failed:', {
      error: error instanceof Error ? error.message : error,
      status: (error as any)?.status,
      service: CONFIG.primary.serviceId,
      template: CONFIG.primary.templates.order,
      recipient: recipientEmail
    });
    throw new Error('Failed to send order confirmation. Please try again later.');
  }
};

/**
 * Formats documents for HTML email display
 */
const formatDocumentsHtml = (documents: DocumentDeliveryData['documents']) => {
  return documents.map(doc => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
      <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${doc.name}</h4>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong>Category:</strong> ${doc.category.charAt(0).toUpperCase() + doc.category.slice(1)} | 
        <strong>Review Stage:</strong> ${doc.review_stage.replace('_', ' ').toUpperCase()}
      </p>
      <a href="${doc.url}" 
         style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;"
         target="_blank">
        📥 Download Document
      </a>
    </div>
  `).join('');
};

/**
 * Sends document delivery email (uses mohanfiles@gmail.com account)
 */
export const sendDocumentDelivery = async (data: DocumentDeliveryData): Promise<void> => {
  if (!validateEmail(data.customer_email)) {
    throw new Error('Invalid recipient email address');
  }

  // Switch to document account (mohanfiles@gmail.com)
  emailjs.init(CONFIG.documentAccount.publicKey, {
    blockHeadless: true
  });

  const { date, year } = getCurrentDateTime();

  try {
    await emailjs.send(
      CONFIG.documentAccount.serviceId,
      CONFIG.documentAccount.templateId,
      {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        project_title: data.project_title,
        order_id: data.order_id,
        documents_html: formatDocumentsHtml(data.documents),
        documents_count: data.documents.length,
        current_date: date,
        current_year: year,
        company_name: CONFIG.company.name,
        access_expires: data.access_expires || 'Never (lifetime access)',
        support_email: CONFIG.company.supportEmail,
        to_email: data.customer_email,
        reply_to: CONFIG.company.supportEmail
      },
      CONFIG.documentAccount.publicKey
    );
  } catch (error) {
    console.error('Document delivery failed:', {
      error: error instanceof Error ? error.message : error,
      status: (error as any)?.status,
      service: CONFIG.documentAccount.serviceId,
      template: CONFIG.documentAccount.templateId,
      recipient: data.customer_email
    });
    throw new Error('Failed to send documents. Our team has been notified.');
  } finally {
    // Revert to primary account
    emailjs.init(CONFIG.primary.publicKey, {
      blockHeadless: true
    });
  }
};

/**
 * Test all email services
 */
export const testEmailServices = async (testEmail: string = 'test@example.com') => {
  const testDocs = [{
    name: 'Test Document.pdf',
    url: 'https://example.com/test.pdf',
    category: 'manual',
    review_stage: 'final'
  }];

  try {
    // Test contact form (primary account)
    await sendContactForm({
      from_name: 'Test User',
      from_email: testEmail,
      project_type: 'Website',
      budget: '$1000-$2000',
      message: 'This is a test message'
    });

    // Test order confirmation (primary account)
    await sendOrderConfirmation({
      project_title: 'Test Project',
      customer_name: 'Test User',
      price: '$99.00',
      order_id: 'TEST-123'
    }, testEmail);

    // Test document delivery (mohanfiles@gmail.com account)
    await sendDocumentDelivery({
      project_title: 'Test Project',
      customer_name: 'Test User',
      customer_email: testEmail,
      order_id: 'TEST-123',
      documents: testDocs
    });

    console.log('✅ All email tests completed successfully');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    throw error;
  }
};