import { auth, appCheck } from './firebase';
import { getToken } from 'firebase/app-check';

export async function submitPropertyEnquiry(data: any) {
  if (!auth.currentUser) {
    throw new Error('Please sign in to submit an enquiry.');
  }

  const token = await auth.currentUser.getIdToken();
  let appCheckToken = '';
  
  if (appCheck) {
    try {
      const appCheckResponse = await getToken(appCheck, false);
      appCheckToken = appCheckResponse.token;
    } catch (err) {
      console.warn('Failed to get App Check token', err);
    }
  }

  const response = await fetch('/api/enquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Firebase-AppCheck': appCheckToken
    },
    body: JSON.stringify(data)
  });

  const responseData = await response.json();
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(responseData.error || "Too many attempts. Please try again later.");
    }
    throw new Error(responseData.error || "Failed to submit enquiry");
  }

  return responseData;
}

export async function getEnquiryLimit() {
  if (!auth.currentUser) return { count: 0, limit: 5 };
  
  try {
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/enquiries/limit', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to get enquiry limit:', err);
  }
  return { count: 0, limit: 5 };
}
