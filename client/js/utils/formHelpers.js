export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s()-]/g, "");
  const nigerianRegex = /^(0|\+234|234)[789][01]\d{8}$/;
  return nigerianRegex.test(cleaned);
}

export function validateEmail(email) {
  if (!email.includes("@") || !email.endsWith(".com")) {
    return "This email is invalid";
  }
  return null;
}

export function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null; // null means no error, password is valid
}
export function validateFile(file) {
  console.log(file, file.name);
  const fileName = file.name;
  if (!/\.(docs|docx|pdf|png|jpeg|jpg)$/i.test(fileName)) {
    return "Invalid document format";
  }
  function convertToMB(size) {
    const mb = size / 1024 / 1024;
    return mb;
  }

  const fileSizeMb = convertToMB(file.size);
  if (fileSizeMb > 10) {
    return "File must be less than 10MB";
  }
  return null; // null means no error, password is valid
}
export function collectData(form, extraData = {}) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  const mergedData = { ...data, ...extraData };
  return mergedData;
}

export function setupPasswordToggle(toggleId, inputId, iconId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
}
