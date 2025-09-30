import { useEffect, useRef } from 'react';

export function useFloatingHScroll() {
  const containerRef = useRef<HTMLDivElement>(null); // div ที่มี overflow-x-auto
  const ghostRef = useRef<HTMLDivElement>(null);     // แถบเลื่อนลอย

  useEffect(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const inner = ghost.querySelector('.reports-ghostbar-inner') as HTMLDivElement;
    if (!inner) return;

    // หา scroll container แนวตั้ง (main ที่คุณใส่ overflow-y-auto)
    const yScroll = findScrollableAncestor(container) ?? document.scrollingElement ?? document.documentElement;

    let isSyncingA = false;
    let isSyncingB = false;
    let atBottom = false;

    const needHorizontal = () => container.scrollWidth > container.clientWidth + 1;

    const updateVisibility = () => {
      // แสดง ghost bar เฉพาะตอนที่ต้องมีแนวนอนให้เลื่อน และ "ยังไม่ถึงล่างสุด"
      const show = needHorizontal() && !atBottom;
      ghost.classList.toggle('opacity-0', !show);
      ghost.classList.toggle('pointer-events-none', !show);
      ghost.classList.toggle('hidden', !needHorizontal()); // ไม่มีแนวนอนเลยก็ซ่อนถาวร
      // อัปเดตความกว้างของแท่งเลื่อนลอย
      inner.style.width = container.scrollWidth + 'px';
    };

    const handleContainerScroll = () => {
      if (isSyncingB) return;
      isSyncingA = true;
      ghost.scrollLeft = container.scrollLeft;
      isSyncingA = false;
    };

    const handleGhostScroll = () => {
      if (isSyncingA) return;
      isSyncingB = true;
      container.scrollLeft = ghost.scrollLeft;
      isSyncingB = false;
    };

    const handleYScroll = () => {
      const el = yScroll as Element | Document;
      const top   = getScrollTop(el);
      const vh    = getClientHeight(el);
      const sh    = getScrollHeight(el);
      atBottom = top + vh >= sh - 2; // margin of error 2px
      updateVisibility();
    };

    // ให้หมุนล้อเมาส์แนวตั้ง = เลื่อนแนวนอน
    const wheelToHorizontal = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        container.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    // listeners
    container.addEventListener('scroll', handleContainerScroll, { passive: true });
    container.addEventListener('wheel', wheelToHorizontal, { passive: false });
    ghost.addEventListener('scroll', handleGhostScroll, { passive: true });

    // resize & initial
    const ro = new ResizeObserver(updateVisibility);
    ro.observe(container);

    updateVisibility();
    setTimeout(updateVisibility, 0);
    setTimeout(updateVisibility, 300);
    setTimeout(updateVisibility, 1000);

    // vertical scroll
    (yScroll as any)?.addEventListener?.('scroll', handleYScroll, { passive: true });
    handleYScroll();

    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
      container.removeEventListener('wheel', wheelToHorizontal as any);
      ghost.removeEventListener('scroll', handleGhostScroll);
      (yScroll as any)?.removeEventListener?.('scroll', handleYScroll as any);
      ro.disconnect();
    };
  }, []);

  return { containerRef, ghostRef };
}

/* ===== helpers ===== */

function findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let cur: HTMLElement | null = el?.parentElement ?? null;
  while (cur) {
    const style = getComputedStyle(cur);
    if (/(auto|scroll)/.test(style.overflowY)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function getScrollTop(el: Element | Document) {
  return el instanceof Document ? el.documentElement.scrollTop : (el as HTMLElement).scrollTop;
}
function getClientHeight(el: Element | Document) {
  return el instanceof Document ? el.documentElement.clientHeight : (el as HTMLElement).clientHeight;
}
function getScrollHeight(el: Element | Document) {
  return el instanceof Document ? el.documentElement.scrollHeight : (el as HTMLElement).scrollHeight;
}




// import { useEffect, useRef } from 'react';

// // Hook for floating horizontal scrollbar (matches original logic)
// export function useFloatingHScroll() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const ghostRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const container = containerRef.current;
//     const ghost = ghostRef.current;
    
//     if (!container || !ghost) return;

//     const inner = ghost.querySelector('.reports-ghostbar-inner') as HTMLDivElement;
//     if (!inner) return;

//     let isSyncingA = false;
//     let isSyncingB = false;

//     const syncWidthAndToggle = () => {
//       // Adjust inner width to match container's scrollWidth
//       inner.style.width = container.scrollWidth + 'px';

//       // Hide ghost bar if no horizontal scroll needed
//       const needScroll = container.scrollWidth > container.clientWidth + 1;
//       ghost.classList.toggle('hidden', !needScroll);
//     };

//     // Sync scroll positions both ways
//     const handleContainerScroll = () => {
//       if (isSyncingB) return;
//       isSyncingA = true;
//       ghost.scrollLeft = container.scrollLeft;
//       isSyncingA = false;
//     };

//     const handleGhostScroll = () => {
//       if (isSyncingA) return;
//       isSyncingB = true;
//       container.scrollLeft = ghost.scrollLeft;
//       isSyncingB = false;
//     };

//     // Event listeners
//     container.addEventListener('scroll', handleContainerScroll, { passive: true });
//     ghost.addEventListener('scroll', handleGhostScroll, { passive: true });

//     // ResizeObserver for dynamic updates
//     const resizeObserver = new ResizeObserver(syncWidthAndToggle);
//     resizeObserver.observe(container);

//     // Initial sync with delays for font/table loading
//     syncWidthAndToggle();
//     setTimeout(syncWidthAndToggle, 0);
//     setTimeout(syncWidthAndToggle, 300);
//     setTimeout(syncWidthAndToggle, 1000);

//     // Cleanup
//     return () => {
//       container.removeEventListener('scroll', handleContainerScroll);
//       ghost.removeEventListener('scroll', handleGhostScroll);
//       resizeObserver.disconnect();
//     };
//   }, []);

//   return { containerRef, ghostRef };
// }