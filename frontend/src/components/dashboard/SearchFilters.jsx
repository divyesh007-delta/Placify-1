import { useState } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Filter, X } from "lucide-react"

export function SearchFilters() {
  const [selectedFilters, setSelectedFilters] = useState([])

  const filterOptions = {
    jobRole: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"],
    location: ["Bangalore", "Hyderabad", "Mumbai", "Delhi", "Chennai"],
    packageRange: ["0-5 LPA", "5-10 LPA", "10-15 LPA", "15+ LPA"],
    companyType: ["Product", "Service", "Startup", "MNC"],
  }

  const addFilter = (filter) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter])
    }
  }

  const removeFilter = (filter) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Select onValueChange={addFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Job Role" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.jobRole.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={addFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.location.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={addFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Package Range" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.packageRange.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={addFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Company Type" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.companyType.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1">
              {filter}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilters([])}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
