import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  canUpgrade: boolean;
}

export default function SubscriptionLimitModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  canUpgrade 
}: SubscriptionLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" data-testid="text-limit-title">Note Limit Reached</h3>
              <p className="text-sm text-muted-foreground">Free plan allows up to 3 notes</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6" data-testid="text-limit-description">
            You've reached the maximum number of notes for your Free plan. 
            {canUpgrade 
              ? " Upgrade to Pro for unlimited notes and more features."
              : " Contact your admin to upgrade to Pro for unlimited notes."
            }
          </p>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
            {canUpgrade && (
              <Button 
                className="flex-1" 
                onClick={onUpgrade}
                data-testid="button-upgrade-to-pro"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
