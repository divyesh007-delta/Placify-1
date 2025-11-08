import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Building2, Loader2 } from "lucide-react"
import api from "@/services/api"

export function CompanySelectionStep({ data, onUpdate, onNext }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch companies from backend
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async (search = "") => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get("/companies", {
        params: {
          search: search,
          limit: 50 // Increased limit for better search experience
        }
      })
      
      if (response.data.success) {
        setCompanies(response.data.companies)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setError("Failed to load companies")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Debounced search - fetch companies after user stops typing
    const timeoutId = setTimeout(() => {
      fetchCompanies(value)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (data.companyId && data.jobRole && data.status) {
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company & Role Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="company-search">Search Company</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="company-search"
                placeholder="Search for company..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Company selection */}
          <div className="space-y-2">
            <Label>Select Company</Label>
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Loading companies...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No companies found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                        data.companyId === company.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() =>
                        onUpdate({
                          companyId: company.id,
                          companyName: company.name,
                        })
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {company.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{company.name}</p>
                          {company.location && (
                            <p className="text-xs text-muted-foreground truncate">
                              {company.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job role */}
          <div className="space-y-2">
            <Label htmlFor="job-role">Job Role Applied For</Label>
            <Input
              id="job-role"
              placeholder="e.g., Software Development Engineer, Data Analyst, Product Manager"
              value={data.jobRole}
              onChange={(e) => onUpdate({ jobRole: e.target.value })}
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Application Status</Label>
            <RadioGroup
              value={data.status}
              onValueChange={(value) => onUpdate({ status: value })}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value="Selected" id="selected" />
                <Label htmlFor="selected" className="cursor-pointer">
                  Selected ✅
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value="Rejected" id="rejected" />
                <Label htmlFor="rejected" className="cursor-pointer">
                  Rejected ❌
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50">
                <RadioGroupItem value="Pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">
                  Pending ⏳
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!data.companyId || !data.jobRole || !data.status}
          >
            Continue to Rounds Selection
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}