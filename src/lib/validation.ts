export const sanitizeText = (text: string | undefined): string => {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
};

export const validateEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return false;
  const re = /^\+?[\d\s-]{7,20}$/;
  return re.test(phone);
};

export const validateProperty = (property: any) => {
  if (!property.title || property.title.length < 3 || property.title.length > 200) throw new Error('Title must be between 3 and 200 characters');
  if (!property.location || property.location.length < 3 || property.location.length > 200) throw new Error('Location must be between 3 and 200 characters');
  if (!property.price || property.price <= 0) throw new Error('Price must be greater than 0');
  
  property.title = sanitizeText(property.title);
  property.description = sanitizeText(property.description);
  property.location = sanitizeText(property.location);
  if (property.society) property.society = sanitizeText(property.society);
  if (property.tower) property.tower = sanitizeText(property.tower);
  if (property.contactPhone && !validatePhone(property.contactPhone)) throw new Error('Invalid contact phone number');
  
  if (property.description.length > 5000) throw new Error('Description is too long');
  
  return property;
};

export const validateApplication = (application: any) => {
  if (!application.tenantName || application.tenantName.length < 2 || application.tenantName.length > 100) throw new Error('Tenant name must be between 2 and 100 characters');
  if (!validatePhone(application.tenantPhone)) throw new Error('Invalid phone number format');
  
  application.tenantName = sanitizeText(application.tenantName);
  return application;
};

export const validateInquiry = (inquiry: any) => {
  if (!inquiry.name || inquiry.name.length < 2 || inquiry.name.length > 100) throw new Error('Name must be between 2 and 100 characters');
  if (!validateEmail(inquiry.email)) throw new Error('Invalid email format');
  if (!validatePhone(inquiry.phone)) throw new Error('Invalid phone number format');
  
  inquiry.name = sanitizeText(inquiry.name);
  inquiry.requirements = sanitizeText(inquiry.requirements);
  if (inquiry.requirements.length > 2000) throw new Error('Requirements description is too long');
  
  if (inquiry.location) inquiry.location = sanitizeText(inquiry.location);
  return inquiry;
};

export const validateLead = (lead: any) => {
  if (lead.userName) lead.userName = sanitizeText(lead.userName);
  if (lead.userEmail && !validateEmail(lead.userEmail)) throw new Error('Invalid email format');
  if (lead.userPhone && !validatePhone(lead.userPhone)) throw new Error('Invalid phone format');
  
  return lead;
};
