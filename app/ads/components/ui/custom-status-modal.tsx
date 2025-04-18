"use client"
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"
import { CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button" // Import Button for style override

interface CustomStatusModalProps {
  type: "success" | "error" | "warning"
  title: string
  message: string
  subMessage?: string
  onClose: () => void
  adId?: string
  adType?: string
  actionButtonText?: string
}

export default function CustomStatusModal({
  type,
  title,
  message,
  subMessage,
  onClose,
  adId,
  adType,
  actionButtonText = "OK",
}: CustomStatusModalProps) {
  // Common modal styles
  const modalStyles = {
    width: "512px",
    minWidth: "512px",
    maxWidth: "512px",
    maxHeight: "748.8px",
    borderRadius: "32px",
  }

  return (
    <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="p-0 overflow-hidden border-none" style={modalStyles}>
        <div className="relative p-6">
          {/* Top section with icon and close button */}
          <div className="flex justify-center mb-12">
            <div
              className={`${
                type === "success" ? "bg-[#EDFAF3]" : "bg-[#FFF8E7]"
              } rounded-[80px] p-2 flex items-center justify-center w-[56px] h-[56px]`}
            >
              {type === "success" ? (
                <CheckCircle className="h-8 w-8 text-[#008832]" />
              ) : (
                <AlertCircle className="h-8 w-8 text-[#F59E0B]" />
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-black hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content section - left aligned */}
          <div className="mb-12">
            <h2
              className="font-bold mb-6"
              style={{
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "0%",
                fontWeight: 700,
              }}
            >
              {title}
            </h2>

            {type === "success" && (
              <>
                <p
                  className="text-gray-900 mb-6"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    fontWeight: 400,
                  }}
                >
                  You've successfully created Ad{adType && adId ? ` (${adType} ${adId})` : "."}
                </p>

                <p
                  className="text-gray-900"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    fontWeight: 400,
                  }}
                >
                  {message}
                </p>
              </>
            )}

            {type !== "success" && (
              <p
                className="text-gray-900"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  fontWeight: 400,
                }}
              >
                {message}
              </p>
            )}

            {subMessage && (
              <p
                className="text-gray-900 mt-6"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  fontWeight: 400,
                }}
              >
                {subMessage}
              </p>
            )}
          </div>

          {/* Button at the bottom - using Button component with style override */}
          <Button
            onClick={onClose}
            className="w-full h-14 bg-[#00D2FF] hover:bg-[#00BFEA] text-black rounded-full font-bold"
          >
            {actionButtonText}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
