import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { ConfirmDialog } from './ConfirmDialog';

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function SafeLink({ href, children, className = '', ...props }: SafeLinkProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!href) return;
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (!href) return;
    try {
      window.open(href, '_blank', 'noopener,noreferrer');
    } catch {
      // swallow
    }
  };

  const urlForDisplay = (() => {
    try {
      const u = new URL(href);
      return u.toString();
    } catch {
      return href;
    }
  })();

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </a>

      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Harici bağlantı"
        message={`e=mc³ dışındaki bir siteye yönlendiriliyorsunuz:\n\n${urlForDisplay}\n\nBu bağlantıya yalnızca güvenilir olduğundan eminseniz devam edin.`}
        confirmText="Devam et"
        cancelText="Vazgeç"
        variant="warning"
      />
    </>
  );
}

