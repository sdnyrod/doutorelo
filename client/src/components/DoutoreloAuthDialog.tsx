import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const OFFICIAL_DOUTORELO_LOGO_URL = "/manus-storage/doutorelo-logo-branca-pulso-vermelho_1fef1ed6.png";

interface DoutoreloAuthDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function DoutoreloAuthDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: DoutoreloAuthDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);
  const dialogLogo = logo ?? OFFICIAL_DOUTORELO_LOGO_URL;

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-2 p-5 pt-12">
          <div className="flex h-20 w-full items-center justify-center">
            <img
              src={dialogLogo}
              alt="DOUTORELO · HUB de saúde inteligente"
              data-official-doutorelo-logo="access-dialog"
              className="h-16 w-auto max-w-[14rem] object-contain"
            />
          </div>

          {/* Title and subtitle */}
          {title ? (
            <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
              {title}
            </DialogTitle>
          ) : null}
          <DialogDescription className="text-sm text-[#858481] leading-5 tracking-[-0.154px]">
            Acesse sua conta para continuar com segurança no DOUTORELO.
          </DialogDescription>
        </div>

        <DialogFooter className="px-5 py-5">
          {/* Login button */}
          <Button
            onClick={onLogin}
            className="w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]"
          >
            Acessar minha conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
