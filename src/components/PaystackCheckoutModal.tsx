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
    navigator.clipboard.writeText(`*737*50*${totalAmount}*89#`);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E5DDD0] rounded-3xl shadow-2xl overflow-hidden text-[#0F291E] flex flex-col">
        {/* Paystack Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-4 flex items-center justify-between text-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-bold text-sm text-emerald-800 shadow-sm border border-emerald-300">
              P
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#FAF7F2] font-black flex items-center gap-1.5">
                <span>Paystack Gateway</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-[#FAF7F2] font-mono font-bold">
                  {isSandboxMode ? 'Sandbox' : 'Live'}
                </span>
              </div>
              <div className="text-[11px] text-emerald-100 font-semibold">
                Official Settlement in Nigerian Naira (₦)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-1.5 rounded-xl text-[#FAF7F2] hover:bg-white/15 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Reference Bar */}
        <div className="bg-[#FAF7F2] p-5 border-b border-[#E5DDD0] text-center">
          <div className="text-xs text-[#516E60] font-medium">Lagos Party Fiesta 2026 Passes</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#0F291E] font-mono tracking-tight mt-1">
            ₦{totalAmount.toLocaleString('en-NG')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] text-[#516E60] font-mono">
            <span>Ref: {paymentReference}</span>
            <span>•</span>
            <span className="text-emerald-700 font-sans font-semibold">{customerEmail}</span>
          </div>
        </div>

        {/* Payment Channels Tabs */}
        <div className="flex border-b border-[#E5DDD0] text-xs font-semibold bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'card'
                ? 'border-emerald-600 text-emerald-800 bg-[#FAF7F2] font-bold'
                : 'border-transparent text-[#516E60] hover:text-[#0F291E]'
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
                ? 'border-emerald-600 text-emerald-800 bg-[#FAF7F2] font-bold'
                : 'border-transparent text-[#516E60] hover:text-[#0F291E]'
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
                ? 'border-emerald-600 text-emerald-800 bg-[#FAF7F2] font-bold'
                : 'border-transparent text-[#516E60] hover:text-[#0F291E]'
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
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border border-emerald-700 text-xs font-mono space-y-3 shadow-md text-[#FAF7F2]">
                <div className="flex justify-between items-center text-emerald-200 text-[10px]">
                  <span>DEBIT CARD (TEST SIMULATION)</span>
                  <span className="font-bold text-[#FAF7F2]">VERVE / VISA</span>
                </div>
                <div className="text-base tracking-widest text-[#FAF7F2] font-bold select-all font-mono">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between text-[11px] text-emerald-100">
                  <span>EXP: {cardExpiry}</span>
                  <span>CVV: {cardCvv}</span>
                </div>
              </div>

              {/* Quick Fill Test Card Button */}
              <button
                type="button"
                onClick={handleFillDemoCard}
                className="w-full py-1.5 px-3 rounded-lg bg-[#FAF7F2] border border-[#D5CDC0] hover:bg-[#EAE4D8] text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Auto-Fill Paystack Test Card</span>
              </button>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#2D4A3E] font-semibold mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F291E] font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#2D4A3E] font-semibold mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F291E] font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#2D4A3E] font-semibold mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#D5CDC0] rounded-xl px-3.5 py-2.5 text-sm text-[#0F291E] font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#516E60] bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>256-bit encrypted SSL sandbox gateway. Strict server verification.</span>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-3.5 text-xs text-[#2D4A3E]">
              <div className="text-[#516E60]">Transfer exactly ₦{totalAmount.toLocaleString('en-NG')} to this virtual account:</div>
              <div className="bg-white p-3.5 rounded-xl border border-[#E5DDD0] font-mono space-y-2">
                <div className="flex justify-between text-[#516E60]">
                  <span>Bank:</span>
                  <span className="text-[#0F291E] font-semibold">Titan / Wema Bank</span>
                </div>
                <div className="flex justify-between items-center text-[#516E60]">
                  <span>Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-800 font-bold tracking-wider text-sm">9920 1842 10</span>
                    <button
                      type="button"
                      onClick={handleCopyBankAccount}
                      className="text-[#516E60] hover:text-[#0F291E] p-1 rounded cursor-pointer"
                      title="Copy account number"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-[#516E60]">
                  <span>Beneficiary:</span>
                  <span className="text-[#0F291E]">Lagos Party Fiesta 2026</span>
                </div>
              </div>
              <p className="text-[11px] text-[#516E60] leading-relaxed">
                Clicking confirm below triggers server-side verification simulating the instant bank webhook notification.
              </p>
            </div>
          )}

          {activeTab === 'ussd' && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DDD0] space-y-3 text-xs text-[#2D4A3E]">
              <div className="text-[#516E60]">Dial the USSD string from your registered mobile phone:</div>
              <div className="bg-white p-4 rounded-xl border border-[#E5DDD0] font-mono text-center space-y-2">
                <div className="text-xl font-bold text-emerald-800 tracking-wider">
                  *737*50*{totalAmount}*89#
                </div>
                <button
                  type="button"
                  onClick={handleCopyUssd}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F2] text-xs text-[#2D4A3E] hover:text-[#0F291E] border border-[#D5CDC0] cursor-pointer"
                >
                  {copiedUssd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUssd ? 'Copied' : 'Copy USSD String'}</span>
                </button>
                <p className="text-[11px] text-[#516E60] mt-1">GTBank, Access, Zenith, UBA & FirstBank supported</p>
              </div>
            </div>
          )}

          {/* Action Buttons: Server Verification Trigger */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={isVerifying}
              onClick={() => onConfirmVerification('success')}
              className="w-full py-4 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-[#FAF7F2] hover:from-emerald-500 hover:to-teal-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-700/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Bank Decline (Test Inventory Rollback Safety)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-t border-[#E5DDD0] flex items-center justify-between text-[11px] text-[#516E60] font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PCI-DSS Level 1 Certified</span>
          </div>
          <span>Order #{orderReference}</span>
        </div>
      </div>
    </div>
  );
};
