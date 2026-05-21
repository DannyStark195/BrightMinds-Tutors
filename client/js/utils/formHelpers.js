export function validatePhone(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  const nigerianRegex = /^(0|\+234)[789][01]\d{8}$/;
  return nigerianRegex.test(cleaned);
}

export function validateEmail(email){
    if(!(email.contains('@') || email.endsWith('.com'))){
        return 'This email is invalid';
    }
    return null
}

export function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null; // null means no error, password is valid
}

export function collectData(form, extraData = {}){
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const mergedData = {...data, ...extraData}
    return mergedData;
}