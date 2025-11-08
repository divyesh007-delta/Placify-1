import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Users, IndianRupee } from "lucide-react"
import { Link } from "react-router-dom"

export function CompanyCard({ company }) {
  console.log("🔍 CompanyCard Debug - Company ID:", company.id);
  
  // Format company data for display
  const displayData = {
    id: company.id || company.companyId,
    name: company.name,
    logo: company.logo,
    description: company.description,
    location: company.location,
    rating: company.rating,
    experienceCount: company.experienceCount,
    tags: company.tags || [],
    avgPackage: company.stats?.avgPackage ? `₹${company.stats.avgPackage} LPA` : "Not available",
    jobRoles: company.jobRoles?.map(role => role.title) || ["Various roles"]
  };

  return (
    <Link to={`/company/${displayData.id}`} onClick={() => console.log("🔄 Navigating to:", `/company/${displayData.id}`)}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayData.logo || "/placeholder.svg"} alt={`${displayData.name} logo`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {displayData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{displayData.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {displayData.location}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  {displayData.rating}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{displayData.description}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Package:</span>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <IndianRupee className="h-3 w-3" />
                {displayData.avgPackage}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Experiences:</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {displayData.experienceCount}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Popular Roles:</p>
            <div className="flex flex-wrap gap-1">
              {displayData.jobRoles.slice(0, 2).map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
              {displayData.jobRoles.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{displayData.jobRoles.length - 2} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {displayData.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Button className="w-full mt-4 bg-transparent" variant="outline">
            View Details & Analytics
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}