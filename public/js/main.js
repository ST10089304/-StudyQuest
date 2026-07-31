document.querySelectorAll('input, textarea, select').forEach((field) => {
  field.addEventListener('invalid', () => field.classList.add('invalid'));
  field.addEventListener('input', () => field.classList.remove('invalid'));
});
