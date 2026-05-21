function validatePhone(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  const nigerianRegex = /^(0|\+234)[789][01]\d{8}$/;
  return nigerianRegex.test(cleaned);
}

export function collectData(form, extraData = {}){
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const mergedData = {...data, ...extraData}
    return mergedData;
}