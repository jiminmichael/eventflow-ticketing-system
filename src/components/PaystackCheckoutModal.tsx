import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  Hash,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  paymentReference: string;
  totalAmount: number;
  customerEmail: string;
  isSandboxMode?: boolean;
  onConfirmVerification: (action: 'success' | 'failed') => Promise<void>;
  isVerifying: boolean;
}

export const PaystackCheckoutModal: React.FC<PaystackCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderReference,
  paymentReference,
  totalAmount,
  customerEmail,
  isSandboxMode = true,
  onConfirmVerification,
  isVerifying,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('4084 0840 0840 0840');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('408');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedUssd, setCopiedUssd] = useState(false);

  if (!isOpen) return null;

  const handleFillDemoCard = () => {
    setCardNumber('4084 0840 0840 0840');
    setCardExpiry('11/28');
    setCardCvv('408');
  };

  const handleCopyBankAccount = () => {
    navigator.clipboard.writeText('9920184210');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCopyUssd = () => {
    navigator.clipboard.writeText('*737*50*130000*89#');
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Paystack Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm text-white shadow-sm">
              P
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-100 font-extrabold flex items-center gap-1.5">
                <span>Paystack Gateway</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">
                  {isSandboxMode ? 'Test Mode' : 'Live'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-200">
                Official Settlement in Nigerian Naira (₦)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Reference Bar */}
        <div className="bg-zinc-900/90 p-5 border-b border-zinc-800 text-center">
          <div className="text-xs text-zinc-400 font-medium">NaijaVibe Tech Summit 2026 Registration</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight mt-1">
            ₦{totalAmount.toLocaleString('en-NG')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] text-zinc-400 font-mono">
            <span>Ref: {paymentReference}</span>
            <span>•</span>
            <span className="text-emerald-400 font-sans">{customerEmail}</span>
          </div>
        </div>

        {/* Payment Channels Tabs */}
        <div className="flex border-b border-zinc-800 text-xs font-semibold bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'card'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/80 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'transfer'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/80 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ussd')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'ussd'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/80 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>USSD</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'card' && (
            <div className="space-y-3.5">
              {/* Virtual Card Graphic Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-zinc-900 to-teal-950 border border-emerald-500/30 text-xs font-mono space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-zinc-400 text-[10px]">
                  <span>DEBIT CARD (TEST SIMULATION)</span>
                  <span className="font-bold text-emerald-400">VERVE / VISA</span>
                </div>
                <div className="text-base tracking-widest text-white font-bold select-all">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between text-[11px] text-zinc-300">
                  <span>EXP: {cardExpiry}</span>
                  <span>CVV: {cardCvv}</span>
                </div>
              </div>

              {/* Quick Fill Test Card Button for smooth testing */}
              <button
                type="button"
                onClick={handleFillDemoCard}
                className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Auto-Fill Paystack Test Card</span>
              </button>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>256-bit encrypted SSL sandbox gateway. Strict server verification.</span>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3.5 text-xs text-zinc-300">
              <div className="text-zinc-400">Transfer exactly ₦{totalAmount.toLocaleString('en-NG')} to this virtual account:</div>
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 font-mono space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Bank:</span>
                  <span className="text-white font-semibold">Wema Bank / Titan Paystack</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold tracking-wider text-sm">9920 1842 10</span>
                    <button
                      type="button"
                      onClick={handleCopyBankAccount}
                      className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
                      title="Copy account number"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Beneficiary:</span>
                  <span className="text-white">NaijaVibe Summit 2026</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Clicking confirm below triggers server-side verification simulating the instant bank webhook notification.
              </p>
            </div>
          )}

          {activeTab === 'ussd' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs text-zinc-300">
              <div className="text-zinc-400">Dial the USSD string from your registered mobile phone:</div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-center space-y-2">
                <div className="text-xl font-bold text-amber-400 tracking-wider">
                  *737*50*{totalAmount}*89#
                </div>
                <button
                  type="button"
                  onClick={handleCopyUssd}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 text-xs text-zinc-300 hover:text-white border border-zinc-700 cursor-pointer"
                >
                  {copiedUssd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUssd ? 'Copied' : 'Copy USSD String'}</span>
                </button>
                <p className="text-[11px] text-zinc-500 mt-1">GTBank, Access, Zenith, UBA & FirstBank supported</p>
              </div>
            </div>
          )}

          {/* Action Buttons: Server Verification Trigger */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isVerifying}
              onClick={() => onConfirmVerification('success')}
              className="w-full py-4 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Transaction with Paystack...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Authorize & Pay ₦{totalAmount.toLocaleString('en-NG')}</span>
                </>
              )}
            </button>

            {/* Test Payment Failure Trigger for Inventory Rollback */}
            <button
              type="button"
              disabled={isVerifying}
              onClick={() => onConfirmVerification('failed')}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Bank Decline (Test Inventory Rollback Safety)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PCI-DSS Level 1 Certified</span>
          </div>
          <span>Order #{orderReference}</span>
        </div>
      </div>
    </div>
  );
};
