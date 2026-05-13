const copyButtons = document.querySelectorAll('[data-copy]');

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 900);
    } catch {
      window.location.href = `tel:${value.replace(/\D/g, '')}`;
    }
  });
});
