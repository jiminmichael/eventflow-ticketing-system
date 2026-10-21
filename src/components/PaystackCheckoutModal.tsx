import React, { useEffect, useRef } from "react";
import { ArrowUpRight, ShieldCheck, X, Loader2 } from "lucide-react";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  paymentReference: string;
  totalAmount: number;
  customerEmail: string;
  isSandboxMode?: boolean;
  authorizationUrl?: string;
  errorMessage?: string | null;
  onConfirmVerification: (action: "success" | "failed") => Promise<void>;
  isVerifying: boolean;
}
export const PaystackCheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  orderReference,
  paymentReference,
  totalAmount,
  customerEmail,
  isSandboxMode = false,
  authorizationUrl,
  errorMessage,
  onConfirmVerification,
  isVerifying,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [isOpen]);
  const checkoutUrl = (() => {
    try {
      const url = new URL(authorizationUrl || "");
      return url.protocol === "https:" &&
        url.hostname === "checkout.paystack.com"
        ? url.href
        : null;
    } catch {
      return null;
    }
  })();
  return (
    <dialog
      ref={dialog}
      className="checkout-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!isVerifying) onClose();
      }}
      aria-labelledby="checkout-title"
    >
      <div className="checkout-heading">
        <ShieldCheck aria-hidden="true" />
        <h2 id="checkout-title">
          {isSandboxMode ? "Test checkout" : "Secure checkout"}
        </h2>
        <button
          className="icon-button"
          aria-label="Close checkout"
          onClick={onClose}
          disabled={isVerifying}
        >
          <X />
        </button>
      </div>
      <p className="checkout-amount">₦{totalAmount.toLocaleString("en-NG")}</p>
      <p>{customerEmail}</p>
      <p className="checkout-reference">
        Order: {orderReference}
        <br />
        Payment: {paymentReference}
      </p>
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      {isSandboxMode ? (
        <>
          <p className="checkout-notice">
            Development simulation only. No money will be charged. Do not enter
            card or bank details.
          </p>
          <button
            className="btn-primary"
            disabled={isVerifying}
            onClick={() => onConfirmVerification("success")}
          >
            Simulate successful payment
          </button>
          <button
            className="btn-secondary"
            disabled={isVerifying}
            onClick={() => onConfirmVerification("failed")}
          >
            Simulate declined payment
          </button>
        </>
      ) : (
        <>
          <p>
            Paystack securely handles your payment. Your passes are issued only
            after payment is verified.
          </p>
          {checkoutUrl && (
            <a className="btn-primary" href={checkoutUrl}>
              Continue to Paystack <ArrowUpRight size={18} />
            </a>
          )}
          <button
            className="btn-secondary"
            disabled={isVerifying}
            onClick={() => onConfirmVerification("success")}
          >
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Verifying payment…
              </>
            ) : (
              "Check payment status"
            )}
          </button>
          <p className="checkout-notice" role="status">
            If payment is still processing, wait a moment and check again.
            Please do not pay twice.
          </p>
        </>
      )}
    </dialog>
  );
};
