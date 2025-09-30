import { useEffect, useRef } from 'react';

interface FloatingHScrollReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  ghostRef: React.RefObject<HTMLDivElement>;
}
export type BadgeProps = {
  status?: string;
  type?: 'status' | 'code' | string;
  className?: string;
};

const BadgeComp: React.FC<BadgeProps> = ({ status, type = 'status', className = '' }) => {
  const base = 'inline-flex items-center px-2 py-1 text-xs rounded';
  const style = type === 'code' ? ' bg-blue-100 text-blue-700' : ' bg-gray-100 text-gray-700';
  return <span className={`${base}${style} ${className}`}>{status ?? '—'}</span>;
};
export const Badge = BadgeComp;      // ← named export
export default BadgeComp;            // ← default export
export function useFloatingHScroll(): FloatingHScrollReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;

    if (!container || !ghost) return;

    const inner = ghost.querySelector<HTMLDivElement>('.reports-ghostbar-inner');
    if (!inner) return;

    let isSyncingA = false;
    let isSyncingB = false;

    /** Sync ความกว้างของ ghost bar ให้ตรงกับ container */
    const syncWidthAndToggle = () => {
      inner.style.width = `${container.scrollWidth}px`;

      // ซ่อน ghost bar ถ้าไม่จำเป็นต้อง scroll
      const needScroll = container.scrollWidth > container.clientWidth + 1;
      ghost.classList.toggle('hidden', !needScroll);
    };

    /** scroll จาก container -> ghost */
    const handleContainerScroll = () => {
      if (isSyncingB) return;
      isSyncingA = true;
      ghost.scrollLeft = container.scrollLeft;
      isSyncingA = false;
    };

    /** scroll จาก ghost -> container */
    const handleGhostScroll = () => {
      if (isSyncingA) return;
      isSyncingB = true;
      container.scrollLeft = ghost.scrollLeft;
      isSyncingB = false;
    };

    // ✅ Event listeners
    container.addEventListener('scroll', handleContainerScroll, { passive: true });
    ghost.addEventListener('scroll', handleGhostScroll, { passive: true });

    // ✅ ResizeObserver สำหรับ update อัตโนมัติ
    const resizeObserver = new ResizeObserver(syncWidthAndToggle);
    resizeObserver.observe(container);

    // ✅ Initial sync
    syncWidthAndToggle();
    const timers = [
      setTimeout(syncWidthAndToggle, 0),
      setTimeout(syncWidthAndToggle, 300),
      setTimeout(syncWidthAndToggle, 1000),
    ];

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
      ghost.removeEventListener('scroll', handleGhostScroll);
      resizeObserver.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return { containerRef, ghostRef };
}
