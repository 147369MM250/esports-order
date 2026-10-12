import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = "", fallback, ...props }, ref) => {
    const [error, setError] = React.useState(false)

    const handleError = () => {
      setError(true)
    }

    return (
      <img
        ref={ref}
        src={error && fallback ? fallback : src}
        alt={alt}
        onError={handleError}
        className={cn("w-full h-full object-cover", className)}
        {...props}
      />
    )
  }
)
Image.displayName = "Image"

export { Image }
