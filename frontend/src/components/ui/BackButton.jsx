import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(-1)} // go back like router.back()
      className="mb-6 gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Companies
    </Button>
  )
}
