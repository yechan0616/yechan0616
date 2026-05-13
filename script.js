const copyButtons = document.querySelectorAll('[data-copy]');
const page = document.querySelector('.page');
const card = document.querySelector('.card');

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

if (page && card) {
  let startY = 0;
  let currentY = 0;
  let pointerActive = false;
  let dragging = false;
  let startedOnContact = false;
  let readyTimer = 0;

  const DRAG_START_THRESHOLD = 10;
  const clampDrag = (value) => {
    if (page.classList.contains('is-card-docked')) {
      return Math.min(Math.max(value, -260), 0);
    }

    return Math.min(Math.max(value, 0), 260);
  };
  const getDockVisibleHeight = () => (window.matchMedia('(max-width: 480px)').matches ? 42 : 48);

  function updateDockOffset() {
    const pageRect = page.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const dockVisibleHeight = getDockVisibleHeight();
    const dockY = pageRect.height / 2 + cardRect.height / 2 - dockVisibleHeight;

    page.style.setProperty('--card-dock-y', `${Math.max(dockY, 0)}px`);
  }

  function setDocked(nextDocked) {
    updateDockOffset();

    if (nextDocked) {
      page.classList.remove('is-card-undocking');
      page.classList.add('is-card-docked');
      document.body.classList.add('is-card-docked');
      return;
    }

    page.classList.add('is-card-undocking');
    page.classList.remove('is-card-docked');
    document.body.classList.remove('is-card-docked');

    window.setTimeout(() => {
      page.classList.remove('is-card-undocking');
    }, 1500);
  }

  function settleCard() {
    if (!pointerActive) {
      return;
    }

    page.classList.remove('is-card-dragging');
    page.style.removeProperty('--card-drag-y');
    updateDockOffset();

    if (dragging) {
      if (page.classList.contains('is-card-docked')) {
        if (currentY < -42) {
          setDocked(false);
        }
      } else if (currentY > 70) {
        setDocked(true);
      }
    }

    pointerActive = false;
    dragging = false;
    startedOnContact = false;
    currentY = 0;
  }

  card.addEventListener('pointerdown', (event) => {
    startedOnContact = Boolean(event.target.closest('.contact'));

    if (startedOnContact) {
      return;
    }

    pointerActive = true;
    dragging = false;
    startY = event.clientY;
    currentY = 0;
    card.setPointerCapture(event.pointerId);
  });

  card.addEventListener('pointermove', (event) => {
    if (!pointerActive || startedOnContact) {
      return;
    }

    const rawDragY = event.clientY - startY;
    const nextY = clampDrag(rawDragY);

    if (!dragging) {
      if (Math.abs(rawDragY) < DRAG_START_THRESHOLD || nextY === 0) {
        return;
      }

      dragging = true;
      page.classList.remove('is-card-undocking');
      page.classList.add('is-card-dragging');
    }

    currentY = nextY;
    page.style.setProperty('--card-drag-y', `${currentY}px`);
  });

  card.addEventListener('pointerup', settleCard);
  card.addEventListener('pointercancel', settleCard);

  card.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaY) < 18) {
        return;
      }

      event.preventDefault();
      const isDocked = page.classList.contains('is-card-docked');

      if (isDocked && event.deltaY < 0) {
        setDocked(false);
      } else if (!isDocked && event.deltaY > 0) {
        setDocked(true);
      }
    },
    { passive: false },
  );

  page.addEventListener('click', (event) => {
    if (!page.classList.contains('is-card-docked') || card.contains(event.target)) {
      return;
    }

    setDocked(false);
  });

  updateDockOffset();
  window.addEventListener('resize', updateDockOffset);
  card.addEventListener('animationend', () => {
    window.clearTimeout(readyTimer);
    page.classList.add('is-ready');
  });

  readyTimer = window.setTimeout(() => {
    page.classList.add('is-ready');
  }, 2700);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(updateDockOffset);
    resizeObserver.observe(card);
    resizeObserver.observe(page);
  }
}
