import emailjs from '@emailjs/browser';

// Configuration for both EmailJS accounts
const CONFIG = {
  // Primary Account (Existing working account)
  primary: {
    serviceId: 'service_qj44izj',
    publicKey: 'aImlP6dotqO-E3y6h',
    templates: {
      contact: 'template_k92zaj2',
      order: 'purchase_confirmation'
    }
  },
  // Secondary Account (New account with document delivery template)
  documentAccount: {
    serviceId: 'service_3x190fr',      // Replace with actual service ID from new account
    templateId: 'document_delivery',    // Replace with actual template ID from new account
    publicKey: 'exhGN1uuooZbFQ3HL',
    userId: 'exhGN1uuooZbFQ3HL'
  },
  developerEmail: 'mohanselemophile@gmail.com'
};

// Initialize both EmailJS accounts
emailjs.init(CONFIG.primary.publicKey); // Primary account
emailjs.init(CONFIG.documentAccount.userId, {
  publicKey: CONFIG.documentAccount.publicKey,
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
    datetime: now.toISOString()
  };
};

// Email Services

/**
 * Sends contact form email using primary account
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
        to_email: CONFIG.developerEmail,
        reply_to: data.from_email
      },
      CONFIG.primary.publicKey
    );
  } catch (error) {
    console.error('Contact form email failed:', error);
    throw new Error('Failed to send your message. Please try again later.');
  }
};

/**
 * Sends order confirmation using primary account
 */
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
      CONFIG.primary.serviceId,
      CONFIG.primary.templates.order,
      {
        ...data,
        email: recipientEmail,
        current_date: date,
        to_email: recipientEmail,
        reply_to: data.support_email || CONFIG.developerEmail,
        download_instructions: data.download_instructions || 
          'You will receive a separate email with download links for all project documents shortly.',
        support_email: CONFIG.developerEmail
      },
      CONFIG.primary.publicKey
    );
  } catch (error) {
    console.error('Order confirmation failed:', error);
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
 * Formats documents for plain text email display
 */
const formatDocumentsText = (documents: DocumentDeliveryData['documents']) => {
  return documents.map(doc => `
📄 ${doc.name}
   Category: ${doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
   Review Stage: ${doc.review_stage.replace('_', ' ').toUpperCase()}
   Download Link: ${doc.url}
   
`).join('');
};

/**
 * Generates summary of documents by review stage
 */
const generateStageSummary = (documents: DocumentDeliveryData['documents']) => {
  const documentsByStage = documents.reduce((acc, doc) => {
    const stage = doc.review_stage;
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return Object.entries(documentsByStage)
    .map(([stage, docs]) => `${stage.replace('_', ' ').toUpperCase()}: ${docs.length} documents`)
    .join(', ');
};

/**
 * Sends document delivery email using secondary account
 */
export const sendDocumentDelivery = async (data: DocumentDeliveryData): Promise<void> => {
  if (!validateEmail(data.customer_email)) {
    throw new Error('Invalid recipient email address');
  }

  const { date } = getCurrentDateTime();

  try {
    const response = await emailjs.send(
      CONFIG.documentAccount.serviceId,
      CONFIG.documentAccount.templateId,
      {
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        project_title: data.project_title,
        order_id: data.order_id,
        documents_html: formatDocumentsHtml(data.documents),
        documents_text: formatDocumentsText(data.documents),
        documents_count: data.documents.length,
        stage_summary: generateStageSummary(data.documents),
        current_date: date,
        access_expires: data.access_expires || 'Never (lifetime access)',
        support_email: CONFIG.developerEmail,
        to_email: data.customer_email,
        reply_to: CONFIG.developerEmail,
        project_name: data.project_title,
        customer: data.customer_name,
        total_documents: data.documents.length,
        delivery_date: date
      },
      CONFIG.documentAccount.publicKey
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS returned status ${response.status}`);
    }

    console.log(`Document delivery email sent successfully to ${data.customer_email}`);
  } catch (error) {
    console.error('Document delivery email failed:', {
      error,
      templateUsed: CONFIG.documentAccount.templateId,
      serviceUsed: CONFIG.documentAccount.serviceId,
      timestamp: new Date().toISOString()
    });
    throw new Error('Failed to send document delivery email. Please try again later.');
  }
};

/**
 * Sends immediate document delivery after successful order
 */
export const sendImmediateDocumentDelivery = async (
  orderId: string,
  customerEmail: string,
  customerName: string,
  projectTitle: string,
  documents: DocumentDeliveryData['documents']
): Promise<void> => {
  if (documents.length === 0) {
    console.log('No documents found for project, skipping document delivery email');
    return;
  }

  try {
    await sendDocumentDelivery({
      project_title: projectTitle,
      customer_name: customerName,
      customer_email: customerEmail,
      order_id: orderId,
      documents: documents,
      access_expires: 'Never (lifetime access)'
    });

    console.log(`Document delivery completed for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send document delivery email:', error);
    throw error;
  }
};

// Generate download instructions for order confirmation
export const generateDownloadInstructions = (projectTitle: string, orderId: string): string => {
  return `
Thank you for purchasing "${projectTitle}"!

Your Order ID: ${orderId}

📧 What happens next:
• You will receive a separate email containing download links for all project documents
• Documents are organized by review stages
• Each document includes presentations, documentation, and reports
• You'll have lifetime access to these documents

📞 Need help?
Contact us at ${CONFIG.developerEmail}

Thank you for your business! 🚀
  `.trim();
};

/**
 * Test function to verify email services
 */
export const testEmailServices = async (testEmail: string = 'test@example.com') => {
  try {
    // Test contact form
    await sendContactForm({
      from_name: 'Test User',
      from_email: testEmail,
      project_type: 'Website Development',
      budget: '$1000-$2000',
      message: 'This is a test message'
    });
    console.log('Contact form test email sent successfully');

    // Test order confirmation
    await sendOrderConfirmation({
      project_title: 'Test Project',
      customer_name: 'Test User',
      price: '$99.00',
      order_id: 'TEST-123'
    }, testEmail);
    console.log('Order confirmation test email sent successfully');

    // Test document delivery
    await sendDocumentDelivery({
      project_title: 'Test Project',
      customer_name: 'Test User',
      customer_email: testEmail,
      order_id: 'TEST-123',
      documents: [{
        name: 'Test Document.pdf',
        url: 'https://example.com/test.pdf',
        category: 'manual',
        review_stage: 'final'
      }]
    });
    console.log('Document delivery test email sent successfully');

  } catch (error) {
    console.error('Email service test failed:', error);
    throw error;
  }
};